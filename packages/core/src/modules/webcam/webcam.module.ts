import { Module } from '../../core/module';
import { createStore } from './webcam.store';
import Component from './webcam.svelte';

export interface WebcamOptions {
  width?: number;
  height?: number;
}

export class Webcam extends Module {
  name = 'webcam';
  description = 'Webcam input module';
  store = createStore();
  width: number;
  height: number;

  constructor({ width = 224, height = 224 }: WebcamOptions = {}) {
    super();
    this.defineProp('stream', this.store.stream, false);
    this.width = width;
    this.height = height;
    this.out.active = this.store.active;
    this.out.images = this.store.images;
    this.out.thumbnails = this.store.thumbnails;
  }

  mount(): void {
    const target = document.querySelector(`#${this.id}`);
    if (!target) return;
    this.app = new Component({
      target,
      props: {
        title: this.name,
        store: this.store,
        width: this.width,
        height: this.height,
      },
    });
  }
}
