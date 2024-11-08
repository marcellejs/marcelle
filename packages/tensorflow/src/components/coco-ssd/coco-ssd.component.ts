import { load, ObjectDetection, type ObjectDetectionBaseModel } from '@tensorflow-models/coco-ssd';
import { io, ready } from '@tensorflow/tfjs-core';
import {
  Catch,
  type Instance,
  logger,
  Model,
  type ObjectDetectorResults,
  TrainingError,
} from '@marcellejs/core';
import Component from './coco-ssd.view.svelte';

export interface CocoSsdOptions {
  base?: ObjectDetectionBaseModel;
}

export interface CocoInstance extends Instance {
  x: ImageData;
  y: undefined;
}

export class CocoSsd extends Model<CocoInstance, ObjectDetectorResults> {
  title = 'COCO-SSD Object Detection';

  parameters = {};
  serviceName = 'undefined';

  #coco: ObjectDetection;
  #base: ObjectDetectionBaseModel;

  constructor({ base = 'lite_mobilenet_v2' }: CocoSsdOptions = {}) {
    super();
    this.#base = base;
    this.$loading.next(true);
    this.setup();
  }

  async setup(): Promise<void> {
    await ready();
    const cachedModels = await io.listModels();
    const cachedCoco = Object.keys(cachedModels).filter((x) => x.includes('cocossd'));
    try {
      this.#coco = await load({ base: this.#base, modelUrl: `indexeddb://cocossd-${this.#base}` });
    } catch (error) {
      if (cachedCoco.length > 0) {
        await io.removeModel(cachedCoco[0]);
      }
      this.#coco = await load({ base: this.#base });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (this.#coco as any).model.save(`indexeddb://cocossd-${this.#base}`);
    }
    logger.info('COCO-SSD loaded with base `lite_mobilenet_v2`');
    this.$loading.next(false);
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  train(): never {
    throw new TrainingError('Model `CocoSsd` cannot be trained');
  }

  @Catch
  async predict(img: ImageData): Promise<ObjectDetectorResults> {
    if (!this.#coco) {
      throw new Error('Model is not loaded');
    }
    const predictions = await this.#coco.detect(img);
    const outputs = predictions.map((x) => ({
      bbox: x.bbox,
      class: x.class,
      confidence: x.score,
    }));
    return { outputs };
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        loading: this.$loading,
        base: this.#base,
      },
    });
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  save(): never {
    throw new Error('CocoSsd does not support saving');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  load(): never {
    throw new Error('CocoSsd does not support loading');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  download(): never {
    throw new Error('CocoSsd does not support downloading');
  }

  @Catch
  // eslint-disable-next-line class-methods-use-this
  upload(): never {
    throw new Error('CocoSsd does not support uploading');
  }
}
