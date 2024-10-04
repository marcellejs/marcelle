import { Component, Stream, type ObjectDetectorResults } from '../../core';
import View from './detection-boxes.view.svelte';

export class DetectionBoxes extends Component {
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
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        imageStream: this.$imgStream,
        objectDetectionResults: this.$objectDetectionResults,
      },
    });
  }
}
