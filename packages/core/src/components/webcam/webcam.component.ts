import { never } from '@most/core';
import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import { throwError } from '../../utils/error-handling';
import { noop } from '../../utils/misc';
import View from './webcam.view.svelte';

function requestInterval(fn: () => void, delay: number) {
  let start = new Date().getTime();
  let stop = false;
  let animationFrame: number;
  function loop(): void {
    if (stop) {
      return;
    }
    const current = new Date().getTime();
    if (current - start >= delay) {
      fn();
      start = new Date().getTime();
    }
    animationFrame = window.requestAnimationFrame(loop);
  }
  animationFrame = window.requestAnimationFrame(loop);
  return function clear() {
    window.cancelAnimationFrame(animationFrame);
    stop = true;
  };
}

export interface WebcamOptions {
  width?: number;
  height?: number;
  period?: number;
}

export class Webcam extends Component {
  title = 'webcam';

  $active = new Stream(false, true);
  $ready = new Stream(false, true);
  $mediastream = new Stream<MediaStream>(undefined, true);
  $images = new Stream<ImageData>(never(), true);
  $thumbnails = new Stream<string>(never(), true);

  period: number;

  // Webcam stuff
  #width: number;
  #height: number;
  #webcamWidth: number;
  #webcamHeight: number;
  #videoElement = document.createElement('video');
  #thumbnailWidth = 60;
  #unsubActive = noop;
  #stopStreaming = noop;
  #thumbnailCanvas: HTMLCanvasElement;
  #thumbnailCtx: CanvasRenderingContext2D;
  #captureCanvas: HTMLCanvasElement;
  #captureCtx: CanvasRenderingContext2D;

  constructor({ width = 224, height = 224, period = 50 }: WebcamOptions = {}) {
    super();
    this.#width = width;
    this.#height = height;
    this.period = period;

    this.setupCapture();
    this.start();
    this.#videoElement.autoplay = true;
    this.#unsubActive = this.$active.subscribe((v) => {
      this.#stopStreaming();
      if (v) {
        this.loadCameras();
        this.#stopStreaming = requestInterval(this.process.bind(this), this.period);
      } else {
        this.stopCamera();
      }
    });
  }

  getWidth(): number {
    return this.#width;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        width: this.#width,
        height: this.#height,
        active: this.$active,
        mediaStream: this.$mediastream,
        ready: this.$ready,
      },
    });
  }

  stop(): void {
    super.stop();
    this.#stopStreaming();
    this.#unsubActive();
    if (this.$mediastream.get()) {
      for (const track of this.$mediastream.get().getTracks()) {
        track.stop();
      }
    }
  }

  setupCapture(): void {
    this.#thumbnailCanvas = document.createElement('canvas');
    this.#thumbnailCanvas.width = this.#thumbnailWidth;
    this.#thumbnailCanvas.height = (this.#thumbnailWidth * this.#height) / this.#width;
    this.#thumbnailCtx = this.#thumbnailCanvas.getContext('2d');
    this.#captureCanvas = document.createElement('canvas');
    this.#captureCanvas.width = this.#width;
    this.#captureCanvas.height = this.#height;
    this.#captureCtx = this.#captureCanvas.getContext('2d');
  }

  async loadCameras(): Promise<void> {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      this.#webcamWidth = mediaStream.getVideoTracks()[0].getSettings().width;
      this.#webcamHeight = mediaStream.getVideoTracks()[0].getSettings().height;
      this.loadSrcStream(mediaStream);
    } catch (error) {
      throwError(new Error('Webcam not supported'));
    }
  }

  loadSrcStream(s: MediaStream): void {
    this.$mediastream.set(s);
    this.#videoElement.srcObject = s;
    this.#videoElement.onloadedmetadata = () => {
      this.$ready.set(true);
    };
  }

  stopCamera(): void {
    if (this.$mediastream.get()) {
      const tracks = this.$mediastream.get().getTracks();
      for (const track of tracks) {
        track.stop();
        this.#videoElement.srcObject = null;
      }

      this.$ready.set(false);
    }
  }

  process(): void {
    if (!this.$ready.get()) return;
    this.$thumbnails.set(this.captureThumbnail());
    this.$images.set(this.captureImage());
  }

  captureThumbnail(): string {
    if (!this.$ready.get()) return null;
    const hRatio = this.#height / this.#webcamHeight;
    const wRatio = this.#width / this.#webcamWidth;
    if (hRatio > wRatio) {
      const w = (this.#thumbnailCanvas.height * this.#webcamWidth) / this.#webcamHeight;
      this.#thumbnailCtx.drawImage(
        this.#videoElement,
        this.#thumbnailCanvas.width / 2 - w / 2,
        0,
        w,
        this.#thumbnailCanvas.height,
      );
    } else {
      const h = (this.#thumbnailCanvas.width * this.#webcamHeight) / this.#webcamWidth;
      this.#thumbnailCtx.drawImage(
        this.#videoElement,
        0,
        this.#thumbnailCanvas.height / 2 - h / 2,
        this.#thumbnailCanvas.width,
        h,
      );
    }
    return this.#thumbnailCanvas.toDataURL('image/jpeg');
  }

  captureImage(): ImageData {
    if (!this.$ready.get()) return null;
    const hRatio = this.#height / this.#webcamHeight;
    const wRatio = this.#width / this.#webcamWidth;
    if (hRatio > wRatio) {
      const w = (this.#height * this.#webcamWidth) / this.#webcamHeight;
      this.#captureCtx.drawImage(this.#videoElement, this.#width / 2 - w / 2, 0, w, this.#height);
    } else {
      const h = (this.#width * this.#webcamHeight) / this.#webcamWidth;
      this.#captureCtx.drawImage(this.#videoElement, 0, this.#height / 2 - h / 2, this.#width, h);
    }
    return this.#captureCtx.getImageData(0, 0, this.#width, this.#height);
  }
}
