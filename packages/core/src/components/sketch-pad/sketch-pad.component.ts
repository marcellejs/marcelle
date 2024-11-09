import { Component } from '../../core/component';
import View from './sketch-pad.view.svelte';
import { Subject } from 'rxjs';
import { mount, unmount } from 'svelte';

export class SketchPad extends Component {
  title = 'sketchPad';

  $images = new Subject<ImageData>();
  $thumbnails = new Subject<string>();
  $strokeStart = new Subject<void>();
  $strokeEnd = new Subject<void>();

  sketchElement: HTMLCanvasElement;

  #thumbnailWidth = 60;
  #thumbnailCanvas: HTMLCanvasElement;
  #thumbnailCtx: CanvasRenderingContext2D;
  #sketchCtx: CanvasRenderingContext2D;

  constructor() {
    super();
    this.setupCapture();
    this.$strokeEnd.subscribe(() => {
      this.capture();
    });
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        strokeStart: this.$strokeStart,
        strokeEnd: this.$strokeEnd,
        oncanvas: (c: HTMLCanvasElement) => {
          this.sketchElement = c;
          this.#sketchCtx = this.sketchElement.getContext('2d');
        },
      },
    });
    return () => unmount(app);
  }

  setupCapture(): void {
    this.#thumbnailCanvas = document.createElement('canvas');
    this.#thumbnailCanvas.width = this.#thumbnailWidth;
    this.#thumbnailCanvas.height = this.#thumbnailWidth;
    this.#thumbnailCtx = this.#thumbnailCanvas.getContext('2d');
  }

  capture(): void {
    const t = this.captureThumbnail();
    this.$thumbnails.next(t);
    this.$images.next(this.captureImage());
  }

  captureThumbnail(): string {
    this.#thumbnailCtx.drawImage(
      this.sketchElement,
      0,
      0,
      this.#thumbnailCanvas.width,
      this.#thumbnailCanvas.height,
    );
    return this.#thumbnailCanvas.toDataURL('image/jpeg');
  }

  captureImage(): ImageData {
    return this.#sketchCtx.getImageData(0, 0, this.sketchElement.width, this.sketchElement.height);
  }
}
