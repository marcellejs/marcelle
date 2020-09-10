import { empty } from '@most/core';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import Component from './image-drop.svelte';

export class ImageDrop extends Module {
  name = 'image-drop';
  description = 'Drop an image file to a stream';

  $images = new Stream(empty());
  $thumbnails = new Stream(empty());

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
