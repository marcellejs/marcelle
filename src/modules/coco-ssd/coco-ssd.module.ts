import { ObjectDetection, ObjectDetectionBaseModel } from '@tensorflow-models/coco-ssd';
import { logger } from '../../core/logger';
import { ObjectDetector, ObjectDetectorResults } from '../../core/objectDetector';
import { Stream } from '../../core/stream';
import { Catch, TrainingError } from '../../utils/error-handling';
import Component from './coco-ssd.svelte';

export interface CocoSsdOptions {
  base?: ObjectDetectionBaseModel;
}
export class CocoSsd extends ObjectDetector<ImageData, ObjectDetectorResults> {
  name = 'COCO-SSD Object Detection';
  description = 'Object detection module using the tfjs coco-ssd model';

  parameters = {};

  #model: ObjectDetection;
  #base: ObjectDetectionBaseModel;
  $loading: Stream<boolean> = new Stream(true as boolean, true);

  inputShape: number[];

  constructor({ base = 'lite_mobilenet_v2' }: CocoSsdOptions = {}) {
    super();
    this.#base = base;
    this.#model = new ObjectDetection(base);
    this.setup();
  }

  async setup(): Promise<void> {
    await this.#model.load();
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
    if (!this.#model) {
      throw new Error('Model is not loaded');
    }
    const predictions = await this.#model.detect(img);
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
