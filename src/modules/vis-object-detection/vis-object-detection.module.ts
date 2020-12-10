import { Module, Stream, ObjectDetectorResults } from '../../core';
import Component from './vis-object-detection.svelte';

export class VisObjectDetection extends Module {
  title = 'Visualize Object Detections';

  $objectDetectionResults: Stream<ObjectDetectorResults>;
  $imgStream: Stream<ImageData>;

  constructor(imgStream: Stream<ImageData>, objDectectionRes: Stream<ObjectDetectorResults>) {
    super();
    this.$imgStream = imgStream;
    this.$objectDetectionResults = objDectectionRes;
    this.start();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        imageStream: this.$imgStream,
        objectDetectionResults: this.$objectDetectionResults,
      },
    });
  }
}
