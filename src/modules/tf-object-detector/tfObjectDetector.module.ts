import { empty } from '@most/core';
import { ObjectDetection } from '@tensorflow-models/coco-ssd';
import { ObjectDetectorResults } from '../../core/objectDetector';
import { logger } from '../../core/logger';
import { Model } from '../../core/model';
import { Stream } from '../../core/stream';
import { Catch } from '../../utils/error-handling';

export class TfObjectDetector extends Model<ImageData, ObjectDetectorResults> {
  name = 'tfObjectDetector';
  description = 'Object detection module';

  parameters = {};

  model: ObjectDetection | undefined;
  $modelFiles: Stream<[]> = new Stream(empty() as Stream<[]>, false);
  $loading: Stream<boolean> = new Stream(false as boolean, true);

  inputShape: number[];

  constructor() {
    super();
    this.model = new ObjectDetection('lite_mobilenet_v2');
    this.setup();
  }

  async setup(): Promise<void> {
    await this.model.load();
    this.$loading.set(false);
    this.start();
  }

  // eslint-disable-next-line class-methods-use-this
  train(): void {
    logger.log('This model cannot be trained');
  }

  @Catch
  async predict(img: ImageData): Promise<ObjectDetectorResults> {
    if (!this.model) {
      throw new Error('Model is not loaded');
    }
    const predictions = await this.model.detect(img);
    // conversion DetetedObject[] to Array[] could be improved
    const count = predictions.length;
    const objects = [];
    for (let i = 0; i < count; i++) {
      const bbox = [];
      for (let j = 0; j < 4; j++) {
        bbox[j] = predictions[i].bbox[j];
      }
      objects.push({
        bbox,
        class: predictions[i].class,
        confidence: predictions[i].score,
      });
    }
    return {
      outputs: objects,
    };
  }
}
