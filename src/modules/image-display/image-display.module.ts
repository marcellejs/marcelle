import { Module, Stream } from '../../core';
import Component from './image-display.svelte';

export class ImageDisplay extends Module {
  title = 'image display';

  #imageStream: Stream<ImageData> | Stream<ImageData[]>;

  constructor(imageStream: Stream<ImageData> | Stream<ImageData[]>) {
    super();
    this.#imageStream = imageStream;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        imageStream: this.#imageStream,
      },
    });
  }
}
