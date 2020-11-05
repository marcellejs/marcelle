import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { ObjectDetectorResults } from '../../core/objectDetector';
import Component from './visObjectDetection.svelte';

export class VisObjectDetection extends Module {
  name = 'training plot';
  description = 'Plot the loss/accuracy during training';

  $objectDetectionResults: Stream<ObjectDetectorResults>;
  $imgStream: Stream<unknown>;

  constructor(imgStream: Stream<unknown>, objDectectionRes: Stream<ObjectDetectorResults>) {
    super();
    this.$imgStream = imgStream;
    this.$objectDetectionResults = objDectectionRes;
    this.start();
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`) as HTMLElement;
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        id: target.id,
        imageStream: this.$imgStream,
        objectDetectionResults: this.$objectDetectionResults,
      },
    });
  }
}
