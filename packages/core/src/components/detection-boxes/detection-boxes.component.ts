import { BehaviorSubject, Observable } from 'rxjs';
import { Component, type ObjectDetectorResults } from '../../core';
import View from './detection-boxes.view.svelte';

export class DetectionBoxes extends Component {
  title = 'Visualize Object Detections';

  $objectDetectionResults = new BehaviorSubject<ObjectDetectorResults>(null);
  $imgStream = new BehaviorSubject<ImageData>(null);

  constructor(
    imgStream: Observable<ImageData>,
    objDectectionRes: Observable<ObjectDetectorResults>,
  ) {
    super();
    imgStream.subscribe(this.$imgStream);
    objDectectionRes.subscribe(this.$objectDetectionResults);
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
