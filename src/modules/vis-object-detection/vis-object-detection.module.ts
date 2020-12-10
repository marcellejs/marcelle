import { Module, Stream, ObjectDetectorResults } from '../../core';
import Component from './vis-object-detection.svelte';

export class VisObjectDetection extends Module {
  name = 'Visualize Object Detections';

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
        title: this.name,
        imageStream: this.$imgStream,
        objectDetectionResults: this.$objectDetectionResults,
      },
    });
  }
}
