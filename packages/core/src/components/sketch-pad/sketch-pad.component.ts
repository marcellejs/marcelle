import { never } from '@most/core';
import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './sketch-pad.view.svelte';

export class SketchPad extends Component {
  title = 'sketchPad';

  $images = new Stream<ImageData>(never());
  $thumbnails = new Stream<string>(never());
  $strokeStart = new Stream(never());
  $strokeEnd = new Stream(never());

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
        strokeStart: this.$strokeStart,
        strokeEnd: this.$strokeEnd,
      },
    });
    this.$$.app.$on('canvasElement', (e) => {
      this.sketchElement = e.detail;
      this.#sketchCtx = this.sketchElement.getContext('2d');
    });
  }

  setupCapture(): void {
    this.#thumbnailCanvas = document.createElement('canvas');
    this.#thumbnailCanvas.width = this.#thumbnailWidth;
    this.#thumbnailCanvas.height = this.#thumbnailWidth;
    this.#thumbnailCtx = this.#thumbnailCanvas.getContext('2d');
  }

  capture(): void {
    const t = this.captureThumbnail();
    this.$thumbnails.set(t);
    this.$images.set(this.captureImage());
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
