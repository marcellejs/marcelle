import { empty } from '@most/core';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import notify from '../../ui/util/notify';
import Component from './webcam.svelte';

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
}

export class Webcam extends Module {
  name = 'webcam';
  description = 'Webcam input module';

  $active = new Stream(false, true);
  $ready = new Stream(false, true);
  $mediastream = new Stream<MediaStream>(undefined, true);
  $images = new Stream<ImageData>(empty());
  $thumbnails = new Stream<string>(empty());

  // Webcam stuff
  #width: number;
  #height: number;
  #webcamWidth: number;
  #webcamHeight: number;
  #videoElement = document.createElement('video');
  #cameras: MediaDeviceInfo[] = [];
  #camerasListEmitted = false;
  #deviceId: string;
  #thumbnailWidth = 80;
  #unsubActive = (): void => {};
  #stopStreaming = (): void => {};
  #thumbnailCanvas: HTMLCanvasElement;
  #thumbnailCtx: CanvasRenderingContext2D;
  #captureCanvas: HTMLCanvasElement;
  #captureCtx: CanvasRenderingContext2D;

  constructor({ width = 224, height = 224 }: WebcamOptions = {}) {
    super();
    this.#width = width;
    this.#height = height;
    this.setupCapture();
    this.start();
    this.#videoElement.autoplay = true;
    this.#unsubActive = this.$active.subscribe((v) => {
      this.#stopStreaming();
      if (v) {
        if (!this.#camerasListEmitted) {
          this.loadCameras();
        } else {
          this.startCamera();
        }
        this.#stopStreaming = requestInterval(this.process.bind(this), 50);
      } else {
        this.stopCamera();
      }
    });
  }

  getWidth(): number {
    return this.#width;
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
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
    if (this.$mediastream.value) {
      this.$mediastream.value.getTracks().forEach((track) => {
        track.stop();
      });
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

  async loadCamera(deviceId: string): Promise<void> {
    const constraints = {
      video: {
        deviceId: { exact: deviceId },
      },
    };
    try {
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      this.#webcamWidth = s.getVideoTracks()[0].getSettings().width;
      this.#webcamHeight = s.getVideoTracks()[0].getSettings().height;
      this.loadSrcStream(s);
    } catch (error) {
      notify({
        title: 'Error loading camera',
        message: error,
        type: 'danger',
      });
    }
  }

  async loadCameras(): Promise<void> {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      const deviceInfos = await navigator.mediaDevices.enumerateDevices();
      for (let i = 0; i !== deviceInfos.length; i++) {
        const deviceInfo = deviceInfos[i];
        if (deviceInfo.kind === 'videoinput') {
          this.#cameras.push(deviceInfo);
        }
      }
      if (!this.#camerasListEmitted) {
        this.#camerasListEmitted = true;
      }
      if (this.#cameras.length === 1) {
        this.#deviceId = this.#cameras[0].deviceId;
        this.loadCamera(this.#deviceId);
      }
    } catch (error) {
      notify({
        title: 'Webcam not supported',
        message: error,
        type: 'danger',
      });
    }
  }

  loadSrcStream(s: MediaStream): void {
    this.$mediastream.set(s);
    this.#videoElement.srcObject = s;
    this.#videoElement.onloadedmetadata = () => {
      this.$ready.set(true);
    };
  }

  startCamera(): void {
    if (this.#deviceId) {
      this.loadCamera(this.#deviceId);
    }
  }

  stopCamera(): void {
    if (this.$mediastream.value) {
      const tracks = this.$mediastream.value.getTracks();
      tracks.forEach((track) => {
        track.stop();
        this.#videoElement.srcObject = null;
      });
      this.$ready.set(false);
    }
  }

  process(): void {
    this.$images.set(this.captureImage());
    this.$thumbnails.set(this.captureThumbnail());
  }

  captureThumbnail(): string {
    if (!this.$ready.value) return null;
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
    if (!this.$ready.value) return null;
    const hRatio = this.#height / this.#webcamHeight;
    const wRatio = this.#width / this.#webcamWidth;
    if (hRatio > wRatio) {
      const w = (this.#height * this.#webcamWidth) / this.#webcamHeight;
      this.#captureCtx.drawImage(this.#videoElement, this.#width / 2 - w / 2, 0, w, this.#height);
    } else {
      const h = (this.#width * this.#webcamHeight) / this.#webcamWidth;
      this.#captureCtx.drawImage(this.#videoElement, 0, this.#height / 2 - h / 2, this.#width, h);
    }
    // return this.#captureCanvas.toDataURL('image/jpeg');
    return this.#captureCtx.getImageData(0, 0, this.#width, this.#height);
  }
}
