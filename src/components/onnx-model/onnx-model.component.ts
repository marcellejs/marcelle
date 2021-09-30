/* eslint-disable no-underscore-dangle */
import { tidy, browser, reshape, tensor1d } from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-core/dist/public/chained_ops/expand_dims';
import '@tensorflow/tfjs-core/dist/public/chained_ops/transpose';
import '@tensorflow/tfjs-core/dist/public/chained_ops/sub';
import '@tensorflow/tfjs-core/dist/public/chained_ops/div';
import '@tensorflow/tfjs-core/dist/public/chained_ops/softmax';
import { Tensor as OnnxTensor, InferenceSession } from 'onnxjs';
import { ClassifierResults, Model, Stream, logger } from '../../core';
import { Catch, TrainingError } from '../../utils/error-handling';
import Component from './onnx-model.view.svelte';

// Questions:
// - Do we autoscale input images?
// - Do we externalize input scaling/normalization?
// - Do we keep normalization default?
// - How do we deal with missing softmax? auto?

export interface OnnxModelOptions {
  inputShape?: number[];
  channelsFirst?: boolean;
  inputRange?: [number, number];
  normalization?: {
    mean: number[];
    std: number[];
  };
  applySoftmax?: boolean;
  topK?: number;
}

const defaultNormalization: OnnxModelOptions['normalization'] = {
  mean: [0.485, 0.456, 0.406],
  std: [0.229, 0.224, 0.225],
};

export class OnnxModel extends Model<ImageData, ClassifierResults> {
  title = 'onnxModel';

  parameters = {};
  serviceName = 'onnx-models';

  $loading: Stream<boolean> = new Stream(false as boolean, true);
  $ready: Stream<boolean> = new Stream(false as boolean, true);

  inputShape: OnnxModelOptions['inputShape'];
  channelsFirst: OnnxModelOptions['channelsFirst'];
  inputRange: OnnxModelOptions['inputRange'];
  normalization: OnnxModelOptions['normalization'];
  applySoftmax: boolean;
  topK: number;
  modelName = '';
  labels: string[];

  #session: InferenceSession;
  #autoDetectShape: boolean;

  constructor({
    inputRange = [0, 1],
    normalization = defaultNormalization,
    topK = 0,
    channelsFirst = true,
    inputShape = undefined,
    applySoftmax = false,
  }: OnnxModelOptions = {}) {
    super();
    this.#autoDetectShape = !inputShape;
    this.channelsFirst = channelsFirst;
    this.inputShape = inputShape;
    this.inputRange = inputRange;
    this.normalization = normalization;
    this.applySoftmax = applySoftmax;
    this.topK = topK;
    this.start();
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  train(): never {
    throw new TrainingError('Model `OnnxModel` cannot be trained');
  }

  @Catch
  async predict(img: ImageData): Promise<ClassifierResults> {
    if (!this.#session || !this.$ready.value) {
      throw new Error('Model is not loaded');
    }

    const inputTensor = this.preprocess(img);
    const tensorOutput = await this.#session.run([inputTensor]);
    const outputData = tensorOutput.values().next().value.data as Float32Array;
    const probabilities = this.applySoftmax
      ? tensor1d(outputData).softmax().arraySync()
      : Array.from(outputData);

    const getLabel = this.labels
      ? (index: number) => this.labels[index]
      : (index: number) => index.toString();

    let likeliest: string;
    let confidences: Record<string, number>;
    if (this.topK > 0) {
      const sortedProbs = probabilities
        .map((x, i): [number, number] => [i, x])
        .sort((a, b) => b[1] - a[1])
        .slice(0, this.topK);
      likeliest = getLabel(sortedProbs[0][0]);
      // probabilities = sortedProbs.map((x) => x[1]);
      confidences = sortedProbs.reduce(
        (x: Record<string, number>, y: [number, number]) => ({
          ...x,
          [getLabel(y[0])]: y[1],
        }),
        {},
      );
    } else {
      let argmax = 0;
      let crtMax = probabilities[0];
      for (let i = 1; i < probabilities.length; i++) {
        if (probabilities[i] > crtMax) {
          crtMax = probabilities[i];
          argmax = i;
        }
      }
      likeliest = getLabel(argmax);
      confidences = probabilities.reduce(
        (x: Record<string, number>, y: number, i: number) => ({ ...x, [getLabel(i)]: y }),
        {},
      );
    }

    return {
      label: likeliest,
      confidences,
    };
  }

  preprocess(img: ImageData): OnnxTensor {
    const tfTensor = tidy(() => {
      let t = browser.fromPixels(img).expandDims(0);
      if (this.channelsFirst) {
        t = t.transpose([0, 3, 1, 2]);
      }
      t = t.div(255);
      if (this.channelsFirst) {
        t = t.sub(reshape(this.normalization.mean, [1, this.normalization.mean.length, 1, 1]));
        t = t.div(reshape(this.normalization.std, [1, this.normalization.std.length, 1, 1]));
      } else {
        t = t.sub(reshape(this.normalization.mean, [1, 1, 1, this.normalization.mean.length]));
        t = t.div(reshape(this.normalization.std, [1, 1, 1, this.normalization.std.length]));
      }

      return t;
    });
    return new OnnxTensor(tfTensor.dataSync(), 'float32', tfTensor.shape);
  }

  @Catch
  async loadFromUrl(url: string): Promise<void> {
    this.$ready.set(false);
    this.$loading.set(true);
    await this.loadModel(url, url);
    this.$loading.set(false);
    this.$ready.set(true);
  }

  @Catch
  async loadFromFiles(files: File[]): Promise<void> {
    if (files.length <= 0) return;
    this.$ready.set(false);
    this.$loading.set(true);
    const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function onload() {
        const arrayBuffer = this.result as ArrayBuffer;
        resolve(arrayBuffer);
      };
      reader.onerror = function onerror() {
        reject();
      };
      reader.readAsArrayBuffer(files[0]);
    });
    await this.loadModel(buffer, files[0].name);
    this.$loading.set(false);
    this.$ready.set(true);
  }

  @Catch
  async loadModel(source: string | ArrayBuffer, modelName: string): Promise<void> {
    this.#session = new InferenceSession();
    await this.#session.loadModel(source as string);
    this.modelName = modelName;
    try {
      this.detectInputShape();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('ONNX Model shape detection failed', error);
    }
    try {
      await this.warmup();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('ONNX Model warmup failed', error);
    }
  }

  @Catch
  async detectInputShape(): Promise<void> {
    if (!this.#autoDetectShape) return;
    logger.log('Detecting input shape from model...');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expectedDims = (this.#session as any).session._model._graph._allData[0].type.shape.dims;
    if (expectedDims.length === 4) {
      if (expectedDims[3] < 5) {
        this.channelsFirst = false;
      }
      if (expectedDims[0] === 0) {
        expectedDims[0] = 1;
      }
      this.inputShape = expectedDims.slice(1, expectedDims.length);
      logger.log(`Model expects Images with min input dim: [${this.inputShape}]`);
    } else {
      throw new Error(`Expecting input shape of length 4, got: [${expectedDims}]`);
    }
  }

  @Catch
  async warmup(): Promise<void> {
    const [width, height] = this.channelsFirst
      ? this.inputShape.slice(1, 3)
      : this.inputShape.slice(0, 2);
    const warmupImg = new ImageData(width, height);
    for (let i = 0; i < width * height * 4; i++) {
      warmupImg.data[i] = Math.floor(Math.random() * 256);
    }
    const warmupTensor = this.preprocess(warmupImg);
    await this.#session.run([warmupTensor]);
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        loading: this.$loading,
        ready: this.$ready,
        parent: this,
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
