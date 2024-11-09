import type { Tensor1D, Tensor2D, Tensor3D, TensorLike } from '@tensorflow/tfjs-core';
import { browser, image as tfImage, tensor, Tensor, tidy, ready } from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-core/dist/public/chained_ops/mul';
import '@tensorflow/tfjs-core/dist/public/chained_ops/expand_dims';
import { loadGraphModel } from '@tensorflow/tfjs-converter';
import { loadLayersModel } from '@tensorflow/tfjs-layers';
import {
  Catch,
  readJSONFile,
  TrainingError,
  type ClassifierResults,
  type Instance,
} from '@marcellejs/core';
import Component from './tfjs-model.view.svelte';
import { map } from 'rxjs';
import { TFJSBaseModel } from '../../core';
import { browserFiles, http } from '../../core/tfjs-io';
import { mount } from "svelte";

export interface InputTypes {
  image: ImageData;
  generic: TensorLike;
}

function isInputType<T extends keyof InputTypes>(t: keyof InputTypes, tt: T): t is T {
  return t === tt;
}

export interface OutputTypes {
  classification: string;
  segmentation: ImageData | TensorLike;
  generic: TensorLike;
}

export interface PredictionTypes {
  classification: ClassifierResults;
  segmentation: ImageData | TensorLike;
  generic: TensorLike;
}

function isPredictionType<T extends keyof PredictionTypes>(
  t: keyof PredictionTypes,
  tt: T,
): t is T {
  return t === tt;
}

export interface TFJSModelOptions<T, U> {
  inputType: T;
  taskType: U;
  segmentationOptions?: {
    output?: 'image' | 'tensor';
    applyArgmax?: boolean;
  };
}

export interface TFJSInstance<InputType, OutputType> extends Instance {
  x: InputType;
  y: OutputType;
}

export class TFJSModel<
  InputType extends keyof InputTypes,
  TaskType extends keyof OutputTypes,
> extends TFJSBaseModel<
  TFJSInstance<InputTypes[InputType], OutputTypes[TaskType]>,
  PredictionTypes[TaskType]
> {
  title = 'tfjs model';

  inputShape: number[];
  inputType: InputType;
  taskType: TaskType;

  parameters = {};
  segmentationOptions: Record<string, unknown>;

  constructor({
    inputType,
    taskType,
    segmentationOptions = { applyArgmax: false, output: 'image' },
  }: TFJSModelOptions<InputType, TaskType>) {
    super();
    this.segmentationOptions = { applyArgmax: false, output: 'image', ...segmentationOptions };
    this.inputType = inputType;
    this.taskType = taskType;
    this.$training.subscribe(({ status }) => {
      if (status === 'loaded') {
        this.inputShape = this.model.inputs[0].shape.map((x) => (x && x > 0 ? x : 1));
      }
    });
    this.$training.pipe(map(({ status }) => status === 'loading')).subscribe(this.$loading);
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  train(): never {
    throw new TrainingError('Model `TfModel` cannot be trained');
  }

  @Catch
  async predict(input: InputTypes[InputType]): Promise<PredictionTypes[TaskType]> {
    if (!this.model || this.$training.getValue().status !== 'loaded') {
      throw new Error('Model is not loaded');
    }

    const outputs = tidy(() => {
      const inputTensor = this.preprocess(input);
      return (this.model.predict(inputTensor.expandDims(0)) as unknown as Tensor).gather(0);
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

  async postprocess(outputs: Tensor): Promise<PredictionTypes[TaskType]>;
  @Catch
  async postprocess(outputs: Tensor): Promise<PredictionTypes[keyof PredictionTypes]> {
    if (isPredictionType(this.taskType, 'classification')) {
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
    if (isPredictionType(this.taskType, 'segmentation')) {
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
    if (isPredictionType(this.taskType, 'generic')) {
      return outputs.array();
    }
    throw new Error('Invalid output data type');
  }

  @Catch
  async loadFromFiles(files: File[]): Promise<void> {
    this.$training.next({
      status: 'loading',
    });
    await ready();
    try {
      const jsonFiles = files.filter((x) => x.name.includes('.json'));
      const weightFiles = files.filter((x) => x.name.includes('.bin'));
      if (jsonFiles.length !== 1) {
        const e = new Error('The provided files are not compatible with this model');
        e.name = 'File upload error';
        throw e;
      }
      this.$training.next({ status: 'loading' });
      if (files.length) {
        const jsonData = await readJSONFile(jsonFiles[0]);
        this.loadFn = jsonData.format === 'graph-model' ? loadGraphModel : loadLayersModel;
        this.model = await this.loadFn(browserFiles([jsonFiles[0], ...weightFiles]));
        await this.warmup();
        this.$training.next({
          status: 'loaded',
          data: {
            source: 'file',
          },
        });
      }
    } catch (error) {
      this.$training.next({
        status: 'error',
      });
      throw error;
    }
  }

  @Catch
  async loadFromUrl(url: string): Promise<void> {
    this.$training.next({
      status: 'loading',
    });
    await ready();
    try {
      const modelJson = await fetch(url).then((res) => res.json());
      this.loadFn = modelJson.format === 'graph-model' ? loadGraphModel : loadLayersModel;
      this.model = await this.loadFn(http(url));
      await this.warmup();
      this.$training.next({
        status: 'loaded',
        data: {
          source: 'url',
          url,
        },
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[tf-model] Loading error', error);
      this.$training.next({
        status: 'error',
      });
      throw error;
    }
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = mount(Component, {
          target: t,
          props: {
            training: this.$training,
          },
        });
  }
}
