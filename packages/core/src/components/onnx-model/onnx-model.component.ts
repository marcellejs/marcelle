import type { RegularArray } from '@tensorflow/tfjs-core/dist/types';
import ort from 'onnxruntime-web';
import { ClassifierResults, Model, ModelOptions, Stream } from '../../core';
import { Catch, TrainingError } from '../../utils/error-handling';
import Component from './onnx-model.view.svelte';

export interface InputTypes {
  image: ImageData;
  generic: RegularArray<number>;
}

export interface OutputTypes {
  classification: ClassifierResults;
  generic: Record<string, Array<number>>;
}

function isInputType<T extends keyof InputTypes>(t: keyof InputTypes, tt: T): t is T {
  return t === tt;
}

function isOutputType<T extends keyof OutputTypes>(t: keyof OutputTypes, tt: T): t is T {
  return t === tt;
}

export interface ONNXModelOptions<T, U> extends ModelOptions {
  inputType: T;
  taskType: U;
  inputShape: number[];
}

export class OnnxModel<
  InputType extends keyof InputTypes,
  TaskType extends keyof OutputTypes,
> extends Model<InputTypes[InputType], OutputTypes[TaskType]> {
  title = 'onnx model';

  parameters = {};
  serviceName = 'onnx-models';

  $loading: Stream<boolean> = new Stream(false as boolean, true);
  $ready: Stream<boolean> = new Stream(false as boolean, true);

  inputType: InputType;
  taskType: TaskType;

  inputShape: number[];
  modelName = '';
  labels: string[];
  lockLoading = Promise.resolve();

  #session: ort.InferenceSession;

  constructor({ inputType, taskType, inputShape, ...rest }: ONNXModelOptions<InputType, TaskType>) {
    super(rest);
    this.inputType = inputType;
    this.taskType = taskType;
    this.inputShape = inputShape;
    this.start();
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  train(): never {
    throw new TrainingError('Model `OnnxModel` cannot be trained');
  }

  @Catch
  async predict(input: InputTypes[InputType]): Promise<OutputTypes[TaskType]> {
    if (!this.#session || !this.$ready.get()) {
      throw new Error('Model is not loaded');
    }

    const inputTensor = this.preprocess(input);
    const outputs = await this.#session.run({ [this.#session.inputNames[0]]: inputTensor });
    const result = await this.postprocess(outputs);

    return result;
  }

  @Catch
  async loadFromUrl(url: string): Promise<void> {
    this.$training.set({
      status: 'loading',
    });
    this.$ready.set(false);
    this.$loading.set(true);
    try {
      await this.loadModel(url, url);
      this.$training.set({
        status: 'loaded',
        data: {
          source: 'url',
          url,
        },
      });
      this.$loading.set(false);
      this.$ready.set(true);
    } catch (error) {
      this.$training.set({
        status: 'error',
      });
      this.$loading.set(false);
      throw error;
    }
  }

  @Catch
  async loadFromFile(file: File): Promise<void> {
    if (!file) return;
    this.$training.set({
      status: 'loading',
    });
    this.$ready.set(false);
    this.$loading.set(true);
    try {
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function onload() {
          const arrayBuffer = this.result as ArrayBuffer;
          resolve(arrayBuffer);
        };
        reader.onerror = function onerror() {
          reject();
        };
        reader.readAsArrayBuffer(file);
      });
      await this.loadModel(buffer, file.name);
      this.$training.set({
        status: 'loaded',
        data: {
          source: 'file',
        },
      });
      this.$loading.set(false);
      this.$ready.set(true);
    } catch (error) {
      this.$training.set({
        status: 'error',
      });
      this.$loading.set(false);
      throw error;
    }
  }

  @Catch
  async loadModel(source: string | ArrayBuffer, modelName: string): Promise<void> {
    this.ready = false;
    this.lockLoading = this.lockLoading
      .then(() => ort.InferenceSession.create(source as string))
      .then((session) => {
        this.#session = session;
      });
    await this.lockLoading;
    this.modelName = modelName;
    try {
      await this.warmup();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('ONNX Model warmup failed', error);
    }
    this.ready = true;
  }

  @Catch
  preprocess(input: InputTypes[InputType]): ort.Tensor {
    if (isInputType(this.inputType, 'image')) {
      return this.preprocessImage(input as InputTypes['image']);
    }
    if (isInputType(this.inputType, 'generic')) {
      const flatInput = (input as InputTypes['generic']).flat().flat().flat().flat().flat();
      return new ort.Tensor('float32', Float32Array.from(flatInput), this.inputShape);
    }
    throw new Error('Invalid input data type');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  preprocessImage(img: InputTypes['image']): ort.Tensor {
    throw new Error('ONNX for Images: Not yet implemented');
    // See: https://github.com/marcellejs/marcelle/blob/dc9f5183f6d8fefdc869748d22ec81a3310e4f04/src/components/onnx-model/onnx-model.component.ts
  }

  async postprocess(outputs: ort.InferenceSession.OnnxValueMapType): Promise<OutputTypes[TaskType]>;
  @Catch
  async postprocess(
    outputs: ort.InferenceSession.OnnxValueMapType,
  ): Promise<OutputTypes[keyof OutputTypes]> {
    if (isOutputType(this.taskType, 'classification')) {
      // throw new Error('Classifier is not yet implemented');
      const getLabel = this.labels
        ? (index: number) => this.labels[index]
        : (index: number) => index.toString();

      const confidences = Array.from(outputs.probabilities.data as Float32Array).reduce(
        (x: Record<string, number>, y: number, i: number) => ({ ...x, [getLabel(i)]: y }),
        {},
      );

      return {
        label: getLabel((outputs.label.data as Int32Array)[0]),
        confidences,
      };
    }

    if (isOutputType(this.taskType, 'generic')) {
      const res: Record<string, Array<number>> = {};
      for (const name of this.#session.outputNames) {
        res[name] = Array.from(outputs[name].data as Float32Array);
      }
      return res;
    }
    throw new Error('Invalid output data type');
  }

  async warmup(): Promise<void> {
    const data = Float32Array.from(Array(this.inputShape.reduce((a, b) => a * b, 1)), () =>
      Math.random(),
    );
    const warmupTensor = new ort.Tensor('float32', data, this.inputShape);
    await this.#session.run({ [this.#session.inputNames[0]]: warmupTensor });
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        training: this.$training,
      },
    });
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  save(): never {
    throw new Error('OnnxModel does not support saving');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  load(): never {
    throw new Error('OnnxModel does not support loading');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  download(): never {
    throw new Error('OnnxModel does not support downloading');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  upload(): never {
    throw new Error('OnnxModel does not support uploading');
  }
}
