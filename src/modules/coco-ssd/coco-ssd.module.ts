import { load, ObjectDetection, ObjectDetectionBaseModel } from '@tensorflow-models/coco-ssd';
import { io } from '@tensorflow/tfjs-core';
import { Model, ModelConstructor, ObjectDetector, ObjectDetectorResults } from '../../core';
import { logger } from '../../core/logger';
import { Stream } from '../../core/stream';
import { Catch, TrainingError } from '../../utils/error-handling';
import Component from './coco-ssd.svelte';

export interface CocoSsdOptions {
  base?: ObjectDetectionBaseModel;
}

export class CocoSsd extends ObjectDetector(Model as ModelConstructor<Model>) {
  name = 'COCO-SSD Object Detection';
  description = 'Object detection module using the tfjs coco-ssd model';

  parameters = {};

  #coco: ObjectDetection;
  #base: ObjectDetectionBaseModel;
  $loading: Stream<boolean> = new Stream(true as boolean, true);

  constructor({ base = 'lite_mobilenet_v2' }: CocoSsdOptions = {}) {
    super();
    this.#base = base;
    this.setup();
  }

  async setup(): Promise<void> {
    const cachedModels = await io.listModels();
    const cachedCoco = Object.keys(cachedModels).filter((x) => x.includes('cocossd'));
    try {
      this.#coco = await load({ base: this.#base, modelUrl: `indexeddb://cocossd-${this.#base}` });
    } catch (error) {
      if (cachedCoco.length > 0) {
        await io.removeModel(cachedCoco[0]);
      }
      this.#coco = await load({ base: this.#base });
      // @ts-ignore
      await this.#coco.model.save(`indexeddb://cocossd-${this.#base}`);
    }
    logger.info('COCO-SSD loaded with base `lite_mobilenet_v2`');
    this.$loading.set(false);
    this.start();
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

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        loading: this.$loading,
        base: this.#base,
      },
    });
  }
}
