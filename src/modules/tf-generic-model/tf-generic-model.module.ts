import {
  browser,
  image as tfImage,
  tensor,
  Tensor,
  Tensor1D,
  Tensor2D,
  Tensor3D,
  TensorLike,
  tidy,
} from '@tensorflow/tfjs-core';
import { loadGraphModel } from '@tensorflow/tfjs-converter';
import { loadLayersModel } from '@tensorflow/tfjs-layers';
import { ClassifierResults, TFJSModel, TFJSModelOptions } from '../../core';
import { logger } from '../../core/logger';
import { Catch } from '../../utils/error-handling';
import { readJSONFile } from '../../utils/file-io';
import Component from './tf-generic-model.svelte';
import { browserFiles, http } from '../../core/model/tfjs-io';

export interface InputTypes {
  image: ImageData;
  generic: TensorLike;
}

function isInputType<T extends keyof InputTypes>(t: keyof InputTypes, tt: T): t is T {
  return t === tt;
}

export interface OutputTypes {
  classification: ClassifierResults;
  segmentation: ImageData | TensorLike;
  generic: TensorLike;
}

function isOutputType<T extends keyof OutputTypes>(t: keyof OutputTypes, tt: T): t is T {
  return t === tt;
}

export interface TFJSGenericModelOptions<T, U> extends TFJSModelOptions {
  inputType: T;
  taskType: U;
  segmentationOptions?: {
    output?: 'image' | 'tensor';
    applyArgmax?: boolean;
  };
}

export class TFJSGenericModel<
  InputType extends keyof InputTypes,
  TaskType extends keyof OutputTypes
> extends TFJSModel<InputTypes[InputType], OutputTypes[TaskType]> {
  title = 'tfjs generic model';

  inputShape: number[];
  inputType: InputType;
  taskType: TaskType;

  parameters = {};
  segmentationOptions: Record<string, unknown>;

  constructor({
    inputType,
    taskType,
    segmentationOptions = { applyArgmax: false, output: 'image' },
    ...rest
  }: TFJSGenericModelOptions<InputType, TaskType>) {
    super(rest);
    this.segmentationOptions = { applyArgmax: false, output: 'image', ...segmentationOptions };
    this.inputType = inputType;
    this.taskType = taskType;
    this.$training.subscribe(({ status }) => {
      if (status === 'loaded') {
        this.inputShape = this.model.inputs[0].shape.map((x) => (x && x > 0 ? x : 1));
      }
    });
  }

  train(): void {
    logger.log('This model cannot be trained', this.model);
  }

  @Catch
  async predict(input: InputTypes[InputType]): Promise<OutputTypes[TaskType]> {
    if (!this.model || this.$training.value.status !== 'loaded') {
      throw new Error('Model is not loaded');
    }

    const outputs = tidy(() => {
      const inputTensor = this.preprocess(input);
      return ((this.model.predict(inputTensor.expandDims(0)) as unknown) as Tensor).gather(0);
    });
    const result = await this.postprocess(outputs);

    outputs.dispose();

    return result;
  }

  @Catch
  preprocess(input: InputTypes[InputType]): Tensor {
    if (isInputType(this.inputType, 'image')) {
      return this.preprocessImage(input as InputTypes['image']);
    }
    if (isInputType(this.inputType, 'generic')) {
      return tensor(input as InputTypes['generic']);
    }
    throw new Error('Invalid input data type');
  }

  @Catch
  preprocessImage(img: InputTypes['image']): Tensor3D {
    return tfImage.resizeBilinear(browser.fromPixels(img), [
      this.inputShape[1],
      this.inputShape[2],
    ]);
  }

  async postprocess(outputs: Tensor): Promise<OutputTypes[TaskType]>;
  @Catch
  async postprocess(outputs: Tensor): Promise<OutputTypes[keyof OutputTypes]> {
    if (isOutputType(this.taskType, 'classification')) {
      // throw new Error('Classifier is not yet implemented');
      const getLabel = this.labels
        ? (index: number) => this.labels[index]
        : (index: number) => index.toString();

      const likeliest = tidy(() => (outputs as Tensor1D).argMax().dataSync()[0]);
      const confidences = (outputs as Tensor1D)
        .arraySync()
        .reduce(
          (x: Record<string, number>, y: number, i: number) => ({ ...x, [getLabel(i)]: y }),
          {},
        );

      return {
        label: getLabel(likeliest),
        confidences,
      };
    }
    if (isOutputType(this.taskType, 'segmentation')) {
      const [width, height] = (outputs as Tensor3D).shape;

      const processedOutputs = this.segmentationOptions.applyArgmax
        ? tidy(() => outputs.argMax(-1).mul(0.5))
        : outputs;
      const mask =
        this.segmentationOptions.output === 'image'
          ? new ImageData(
              await browser.toPixels(processedOutputs as Tensor2D | Tensor3D),
              width,
              height,
            )
          : await processedOutputs.array();
      if (this.segmentationOptions.applyArgmax) {
        processedOutputs.dispose();
      }
      return mask;
    }
    if (isOutputType(this.taskType, 'generic')) {
      return outputs.array();
    }
    throw new Error('Invalid output data type');
  }

  @Catch
  async loadFromFiles(files: File[]): Promise<void> {
    this.$training.set({
      status: 'loading',
    });
    try {
      const jsonFiles = files.filter((x) => x.name.includes('.json'));
      const weightFiles = files.filter((x) => x.name.includes('.bin'));
      if (jsonFiles.length !== 1) {
        const e = new Error('The provided files are not compatible with this model');
        e.name = 'File upload error';
        throw e;
      }
      this.$training.set({ status: 'loading' });
      if (files.length) {
        const jsonData = await readJSONFile(jsonFiles[0]);
        this.loadFn = jsonData.format === 'graph-model' ? loadGraphModel : loadLayersModel;
        this.model = await this.loadFn(browserFiles([jsonFiles[0], ...weightFiles]));
        await this.warmup();
        await this.save(true);
        this.$training.set({
          status: 'loaded',
          data: {
            source: 'file',
          },
        });
      }
    } catch (error) {
      this.$training.set({
        status: 'error',
      });
      throw error;
    }
  }

  @Catch
  async loadFromUrl(url: string): Promise<void> {
    this.$training.set({
      status: 'loading',
    });
    try {
      const modelJson = await fetch(url).then((res) => res.json());
      this.loadFn = modelJson.format === 'graph-model' ? loadGraphModel : loadLayersModel;
      this.model = await this.loadFn(http(url));
      await this.warmup();
      this.$training.set({
        status: 'loaded',
        data: {
          source: 'url',
          url,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[tf-generic-model] Loading error', error);
      this.$training.set({
        status: 'error',
      });
      throw error;
    }
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
}