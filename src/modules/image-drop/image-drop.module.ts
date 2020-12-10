import { never } from '@most/core';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import Component from './image-drop.svelte';

export class ImageDrop extends Module {
  name = 'image-drop';

  $images = new Stream(never());
  $thumbnails = new Stream(never());

  constructor() {
    super();
    this.start();
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        images: this.$images,
        thumbnails: this.$thumbnails,
      },
    });
  }
}
