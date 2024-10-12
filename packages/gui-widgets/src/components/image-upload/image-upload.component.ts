import { Component } from '@marcellejs/core';
import View from './image-upload.view.svelte';
import { Subject } from 'rxjs';

export interface ImageUploadOptions {
  width?: number;
  height?: number;
}

export class ImageUpload extends Component {
  title = 'image upload';

  $images = new Subject<ImageData>();
  $thumbnails = new Subject<string>();

  #width: number;
  #height: number;

  constructor({ width = 0, height = 0 }: ImageUploadOptions = {}) {
    super();
    this.#width = width;
    this.#height = height;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        images: this.$images,
        thumbnails: this.$thumbnails,
        width: this.#width,
        height: this.#height,
      },
    });
  }
}
