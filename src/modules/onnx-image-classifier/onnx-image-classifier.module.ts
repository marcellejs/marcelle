/* eslint-disable no-underscore-dangle */
import ndarray from 'ndarray';
import ops from 'ndarray-ops';
import { Tensor, InferenceSession } from 'onnxjs';
import { ClassifierResults, Model, Classifier, Stream, ModelConstructor, logger } from '../../core';
import { Catch } from '../../utils/error-handling';
import Component from './onnx-image-classifier.svelte';

function softmax(arr: number[]): number[] {
  const C = Math.max(...arr);
  const d = arr.map((y) => Math.exp(y - C)).reduce((a, b) => a + b);
  return arr.map((value) => {
    return Math.exp(value - C) / d;
  });
}

export interface OnnxImageClassifierOptions {
  inputRange?: [number, number];
  normalization?: {
    mean: [number, number, number];
    std: [number, number, number];
  };
  topK?: number;
}

const defaultNormalization: OnnxImageClassifierOptions['normalization'] = {
  mean: [0.485, 0.456, 0.406],
  std: [0.229, 0.224, 0.225],
};

// export class OnnxImageClassifier extends Module {
export class OnnxImageClassifier extends Classifier(Model as ModelConstructor<Model>) {
  title = 'onnxImageClassifier';

  parameters = {};
  session: InferenceSession;

  $loading: Stream<boolean> = new Stream(false as boolean, true);
  $ready: Stream<boolean> = new Stream(false as boolean, true);
  inputRange: OnnxImageClassifierOptions['inputRange'];
  normalization: OnnxImageClassifierOptions['normalization'];
  topK: number;
  expectedDims: number[] = [];
  modelName: string = '';

  constructor({
    inputRange = [0, 1],
    normalization = defaultNormalization,
    topK = 0,
  }: OnnxImageClassifierOptions = {}) {
    super();
    this.inputRange = inputRange;
    this.normalization = normalization;
    this.topK = topK;
    this.start();
  }

  // eslint-disable-next-line class-methods-use-this
  train(): void {
    logger.log('This model cannot be trained');
  }

  @Catch
  async predict(img: ImageData): Promise<ClassifierResults> {
    if (!this.session || !this.$ready.value) {
      throw new Error('Model is not loaded');
    }
    const inputTensor = this.preprocess(img);
    const tensorOutput = await this.session.run([inputTensor]);
    const outputData = tensorOutput.values().next().value.data as Float32Array;
    const probabilities = softmax(Array.prototype.slice.call(outputData));

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

  /**
   * Preprocess raw image data to match Resnet50 requirement.
   */
  preprocess(img: ImageData) {
    const { data, width, height } = img;

    // data processing
    const dataTensor = ndarray(new Float32Array(data), [width, height, 4]);
    const dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [
      1,
      3,
      width,
      height,
    ]);
    ops.assign(dataProcessedTensor.pick(0, 0, null, null), dataTensor.pick(null, null, 0));
    ops.assign(dataProcessedTensor.pick(0, 1, null, null), dataTensor.pick(null, null, 1));
    ops.assign(dataProcessedTensor.pick(0, 2, null, null), dataTensor.pick(null, null, 2));
    ops.divseq(dataProcessedTensor, 255);
    ops.mulseq(dataProcessedTensor, this.inputRange[1] - this.inputRange[0]);
    ops.addseq(dataProcessedTensor, this.inputRange[0]);
    ops.subseq(dataProcessedTensor.pick(0, 0, null, null), this.normalization.mean[0]);
    ops.subseq(dataProcessedTensor.pick(0, 1, null, null), this.normalization.mean[1]);
    ops.subseq(dataProcessedTensor.pick(0, 2, null, null), this.normalization.mean[2]);
    ops.divseq(dataProcessedTensor.pick(0, 0, null, null), this.normalization.std[0]);
    ops.divseq(dataProcessedTensor.pick(0, 1, null, null), this.normalization.std[1]);
    ops.divseq(dataProcessedTensor.pick(0, 2, null, null), this.normalization.std[2]);
    const tensor = new Tensor(new Float32Array(3 * width * height), 'float32', [
      1,
      3,
      width,
      height,
    ]);
    (tensor.data as Float32Array).set(dataProcessedTensor.data);
    return tensor;
  }

  @Catch
  async loadFromUrl(url: string): Promise<void> {
    this.$ready.set(false);
    this.$loading.set(true);
    this.session = new InferenceSession();
    await this.session.loadModel(url);
    this.modelName = url;
    this.expectedDims = (this.session as any).session._model._graph._allData[0].type.shape.dims;
    logger.log(`Model expects Images with min input dim: [${this.expectedDims}]`);
    await this.warmup();
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
    this.session = new InferenceSession();
    await this.session.loadModel(buffer);
    await this.warmup();
    this.modelName = files[0].name;
    this.$loading.set(false);
    this.$ready.set(true);
  }

  @Catch
  async warmup(): Promise<void> {
    const size = this.expectedDims.reduce((a, b) => a * b);
    const warmupTensor = new Tensor(new Float32Array(size), 'float32', this.expectedDims);
    for (let i = 0; i < size; i++) {
      warmupTensor.data[i] = Math.random() * 2.0 - 1.0; // random value [-1.0, 1.0)
    }
    await this.session.run([warmupTensor]);
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
}
