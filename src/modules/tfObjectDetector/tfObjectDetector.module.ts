import { empty } from '@most/core';
// import { io, image as tfImage, browser, Tensor2D } from '@tensorflow/tfjs-core';
import { ObjectDetection } from '@tensorflow-models/coco-ssd';
import { ObjectDetectorResults } from '../../core/objectDetector';
import { logger } from '../../core/logger';
import { Model } from '../../core/model';
import { Stream } from '../../core/stream';
import { Catch } from '../../utils/error-handling';
import Component from './tfObjectDetector.svelte';

export class TfObjectDetector extends Model<ImageData, ObjectDetectorResults> {
  name = 'tfObjectDetector';
  description = 'Object detection module';

  parameters = {};

  model: ObjectDetection | undefined;
  $modelFiles: Stream<[]> = new Stream(empty() as Stream<[]>, false);
  $loading: Stream<boolean> = new Stream(false as boolean, true);
  $img: Stream<unknown> = new Stream(empty() as Stream<unknown>, false);

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
    this.$img.set(img);

    // const instanceCanvas = document.getElementById('mycan');
    // const instanceCtx = instanceCanvas.getContext('2d');
    // instanceCanvas.classList.add('w-full', 'max-w-full');
    // instanceCanvas.width = img.width;
    // instanceCanvas.height = img.height;
    // instanceCtx.putImageData(img, 0, 0);

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
    // return {
    //   label: results.toString(),
    //   confidences: outputs
    //     .arraySync()[0]
    //     .reduce(
    //       (x: Record<string, number>, y: number, i: number) => ({ ...x, [i.toString()]: y }),
    //       {},
    //     ),
    // };
  }

  // async saveModel(): Promise<void> {
  //   await this.model.save('localstorage://my-model-1');
  // }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        loading: this.$loading,
        img: this.$img,
        // modelFiles: this.$modelFiles,
      },
    });
    // this.$$.app.$on('save', () => {
    //   this.saveModel();
    // });
  }
}
