import { never } from '@most/core';
import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './image-upload.view.svelte';

export interface ImageUploadOptions {
  width?: number;
  height?: number;
}

export class ImageUpload extends Component {
  title = 'image upload';

  $images = new Stream(never());
  $thumbnails = new Stream(never());

  #width: number;
  #height: number;

  constructor({ width = 0, height = 0 }: ImageUploadOptions = {}) {
    super();
    this.#width = width;
    this.#height = height;
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
        images: this.$images,
        thumbnails: this.$thumbnails,
        width: this.#width,
        height: this.#height,
      },
    });
  }
}
