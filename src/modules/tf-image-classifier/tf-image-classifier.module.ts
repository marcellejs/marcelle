import { GraphModel, loadGraphModel } from '@tensorflow/tfjs-converter';
import { io, image as tfImage, browser, Tensor2D } from '@tensorflow/tfjs-core';
import { LayersModel, loadLayersModel } from '@tensorflow/tfjs-layers';
import { ClassifierResults, TFJSClassifier } from '../../core';
import { logger } from '../../core/logger';
import { Stream } from '../../core/stream';
import { Catch } from '../../utils/error-handling';
import { readJSONFile } from '../../utils/file-io';
import Component from './tf-image-classifier.svelte';

export class TfImageClassifier extends TFJSClassifier {
  title = 'tfImageClassifier';

  static nextModelId = 0;
  modelId = `tf-image-classifier-${TfImageClassifier.nextModelId++}`;

  parameters = {};

  $loading: Stream<boolean> = new Stream(false as boolean, true);
  $ready: Stream<boolean> = new Stream(false as boolean, true);

  model: LayersModel | GraphModel;
  loadFn: typeof loadGraphModel | typeof loadLayersModel = loadGraphModel;
  inputShape: number[];

  constructor() {
    super();
    this.registerHook('load', 'before', async (context) => {
      this.$loading.set(true);
      this.$ready.set(false);
      return context;
    });
    this.registerHook('load', 'after', async (context) => {
      this.inputShape = Object.values(this.model.inputs[0].shape);
      this.$ready.set(true);
      this.$loading.set(false);
      return context;
    });
    this.start();
  }

  // eslint-disable-next-line class-methods-use-this
  train(): void {
    logger.log('This model cannot be trained');
  }

  @Catch
  async predict(img: ImageData): Promise<ClassifierResults> {
    if (!this.model || !this.$ready.value) {
      throw new Error('Model is not loaded');
    }
    const tensorData = tfImage.resizeBilinear(browser.fromPixels(img), [
      this.inputShape[1],
      this.inputShape[2],
    ]);
    const outputs = this.model.predict(tensorData.expandDims(0)) as Tensor2D;
    const results: number = outputs.argMax(1).dataSync()[0];

    const getLabel = this.labels
      ? (index: number) => this.labels[index]
      : (index: number) => index.toString();

    return {
      label: getLabel(results),
      confidences: outputs
        .arraySync()[0]
        .reduce(
          (x: Record<string, number>, y: number, i: number) => ({ ...x, [getLabel(i)]: y }),
          {},
        ),
    };
  }

  @Catch
  async loadFromFiles(files: File[]): Promise<void> {
    const jsonFiles = files.filter((x) => x.name.includes('.json'));
    const weightFiles = files.filter((x) => x.name.includes('.bin'));
    if (jsonFiles.length !== 1) {
      const e = new Error('The provided files are not compatible with this model');
      e.name = 'File upload error';
      throw e;
    }
    this.$ready.set(false);
    this.$loading.set(true);
    if (files.length) {
      const jsonData = await readJSONFile(jsonFiles[0]);
      this.loadFn = jsonData.format === 'graph-model' ? loadGraphModel : loadLayersModel;
      this.model = await this.loadFn(io.browserFiles([jsonFiles[0], ...weightFiles]));
      this.inputShape = Object.values(this.model.inputs[0].shape);
      await this.save();
      this.$loading.set(false);
      this.$ready.set(true);
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
        loading: this.$loading,
        ready: this.$ready,
      },
    });
  }
}
