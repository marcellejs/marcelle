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

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`) as HTMLElement;
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.title,
        imageStream: this.$imgStream,
        objectDetectionResults: this.$objectDetectionResults,
      },
    });
  }
}
