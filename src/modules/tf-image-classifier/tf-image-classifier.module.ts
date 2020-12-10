import { empty } from '@most/core';
import { io, image as tfImage, browser, Tensor2D } from '@tensorflow/tfjs-core';
import { LayersModel, loadLayersModel } from '@tensorflow/tfjs-layers';
import { ClassifierResults, StoredModel, TFJSClassifier } from '../../core';
import { logger } from '../../core/logger';
import { Stream } from '../../core/stream';
import { Catch } from '../../utils/error-handling';
import Component from './tf-image-classifier.svelte';

export class TfImageClassifier extends TFJSClassifier {
  name = 'tfImageClassifier';

  static nextModelId = 0;
  modelId = `tf-image-classifier-${TfImageClassifier.nextModelId++}`;

  parameters = {};

  $modelFiles: Stream<[]> = new Stream(empty() as Stream<[]>, false);
  $loading: Stream<boolean> = new Stream(false as boolean, true);

  model: LayersModel;
  loadFn = loadLayersModel;
  inputShape: number[];

  constructor() {
    super();
    this.$modelFiles.subscribe((s) => {
      this.loadFromFiles(s);
    });
    this.start();
  }

  // eslint-disable-next-line class-methods-use-this
  train(): void {
    logger.log('This model cannot be trained');
  }

  @Catch
  async predict(img: ImageData): Promise<ClassifierResults> {
    if (!this.model) {
      throw new Error('Model is not loaded');
    }
    const tensorData = tfImage.resizeBilinear(browser.fromPixels(img), [
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

  async loadFromFiles(urls: []): Promise<void> {
    this.$loading.set(true);
    if (urls.length) {
      this.model = await loadLayersModel(io.browserFiles(urls));
      this.inputShape = Object.values(this.model.inputs[0].shape);
      await this.save();
      this.$loading.set(false);
    }
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
  }

  async afterLoad(s: StoredModel): Promise<void> {
    await super.afterLoad(s);
    this.inputShape = Object.values(this.model.inputs[0].shape);
  }
}
