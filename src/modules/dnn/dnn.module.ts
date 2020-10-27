import { browser, io, image as tfImage, Tensor2D } from '@tensorflow/tfjs-core';
import { LayersModel, loadLayersModel } from '@tensorflow/tfjs-layers';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { Catch } from '../../utils/error-handling';
import Component from './dnn.svelte';

export interface DNNResults {
  label: string;
  confidences: { [key: string]: number };
}

export class DNN extends Module {
  name = 'dnn';
  description = 'Generic Deep Neural Network module';

  $modelFiles: Stream<[]> = new Stream([], true);
  $loading: Stream<boolean> = new Stream(false as boolean, true);

  model: LayersModel;
  inputShape: number[];

  constructor() {
    super();
    this.$modelFiles.subscribe((s) => {
      this.load(s);
    });
    this.start();
  }

  async saveModel(): Promise<void> {
    await this.model.save('localstorage://my-model-1');
  }

  async load(urls: []): Promise<void> {
    this.$loading.set(false);
    if (urls.length) {
      this.model = await loadLayersModel(io.browserFiles(urls));
      // console.log('load model', this.model.inputs[0].shape);
      this.inputShape = Object.values(this.model.inputs[0].shape);
      this.$loading.set(true);
    }
  }

  @Catch
  async predict(image: ImageData): Promise<DNNResults> {
    if (!this.model) {
      throw new Error('Model is not loaded');
    }
    const tensorData = tfImage.resizeBilinear(browser.fromPixels(image), [
      this.inputShape[1],
      this.inputShape[2],
    ]);
    const outputs = this.model.predict(tensorData.expandDims(0)) as Tensor2D;
    const results: number = outputs.argMax(1).dataSync()[0];

    return {
      label: results.toString(),
      confidences: outputs
        .arraySync()[0]
        .reduce(
          (x: Record<string, number>, y: number, i: number) => ({ ...x, [i.toString()]: y }),
          {},
        ),
    };
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        loading: this.$loading,
        modelFiles: this.$modelFiles,
      },
    });
    this.$$.app.$on('save', () => {
      this.saveModel();
    });
  }
}
