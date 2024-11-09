import { Component } from '../../core/component';
import { throwError } from '../../utils/error-handling';
import { noop } from '../../utils/misc';
import { rxBind } from '../../utils/rxjs';
import View from './webcam.view.svelte';
import { BehaviorSubject, Subject } from 'rxjs';
import { mount, unmount } from 'svelte';

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
  facingMode?: 'user' | 'environment';
  audio?: boolean;
}

export class Webcam extends Component {
  title = 'webcam';

  $active = new BehaviorSubject(false);
  $ready = new BehaviorSubject(false);
  $mediastream = new BehaviorSubject<MediaStream>(undefined);
  $images = new Subject<ImageData>();
  $thumbnails = new Subject<string>();
  $facingMode: BehaviorSubject<WebcamOptions['facingMode']>;

  period: number;

  // Webcam stuff
  #width: number;
  #height: number;
  #webcamWidth: number;
  #webcamHeight: number;
  #videoElement = document.createElement('video');
  #thumbnailWidth = 60;
  #stopStreaming = noop;
  #thumbnailCanvas: HTMLCanvasElement;
  #thumbnailCtx: CanvasRenderingContext2D;
  #captureCanvas: HTMLCanvasElement;
  #captureCtx: CanvasRenderingContext2D;
  #audio: boolean;

  constructor({
    width = 224,
    height = 224,
    period = 50,
    facingMode = 'user',
    audio = false,
  }: WebcamOptions = {}) {
    super();
    this.#width = width;
    this.#height = height;
    this.period = period;

    this.$facingMode = new BehaviorSubject(facingMode);
    this.#audio = audio;

    this.setupCapture();
    this.#videoElement.autoplay = true;
    this.#videoElement.muted = true;
    this.#videoElement.playsInline = true;
    const reload = (v: boolean) => {
      this.#stopStreaming();
      if (v) {
        this.loadCameras();
        this.#stopStreaming = requestInterval(this.process, this.period);
      } else {
        this.stopCamera();
      }
    };
    this.$active.subscribe(reload);
    this.$facingMode.subscribe(() => this.$active.getValue() && reload(true));
  }

  getWidth(): number {
    return this.#width;
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        width: this.#width,
        height: this.#height,
        facingMode: this.$facingMode,
        active: rxBind(this.$active),
        mediaStream: this.$mediastream,
        ready: this.$ready,
      },
    });
    return () => unmount(app);
  }

  stop(): void {
    this.#stopStreaming();
    if (this.$mediastream.getValue()) {
      for (const track of this.$mediastream.getValue().getTracks()) {
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
        video: { facingMode: { ideal: this.$facingMode.getValue() } },
        audio: this.#audio,
      });
      this.#webcamWidth = mediaStream.getVideoTracks()[0].getSettings().width;
      this.#webcamHeight = mediaStream.getVideoTracks()[0].getSettings().height;
      this.loadSrcStream(mediaStream);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throwError(new Error('Webcam not supported'));
    }
  }

  loadSrcStream(s: MediaStream): void {
    this.$mediastream.next(s);
    this.#videoElement.srcObject = s;
    this.#videoElement.play();
    this.#videoElement.onloadedmetadata = () => {
      this.#webcamWidth = this.#videoElement.videoWidth;
      this.#webcamHeight = this.#videoElement.videoHeight;
      this.$ready.next(true);
    };
  }

  stopCamera(): void {
    if (this.$mediastream.getValue()) {
      const tracks = this.$mediastream.getValue().getTracks();
      for (const track of tracks) {
        track.stop();
        this.#videoElement.srcObject = null;
      }

      this.$ready.next(false);
    }
  }

  process(): void {
    if (!this.$ready.getValue()) return;
    this.$thumbnails.next(this.captureThumbnail());
    this.$images.next(this.captureImage());
  }

  captureThumbnail(): string {
    if (!this.$ready.getValue()) return null;
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
    if (!this.$ready.getValue()) return null;
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
