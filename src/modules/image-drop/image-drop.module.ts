import { never } from '@most/core';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import Component from './image-drop.svelte';

export class ImageDrop extends Module {
  title = 'image-drop';

  $images = new Stream(never());
  $thumbnails = new Stream(never());

  constructor() {
    super();
    this.start();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        images: this.$images,
        thumbnails: this.$thumbnails,
      },
    });
  }
}
