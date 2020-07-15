import { empty } from '@most/core';
import { Module } from '../../core/module';
import Component from './webcam.svelte';
import { Stream } from '../../core/stream';

export interface WebcamOptions {
  width?: number;
  height?: number;
}

export class Webcam extends Module {
  name = 'webcam';
  description = 'Webcam input module';

  #width: number;
  #height: number;

  $active = new Stream(false, true);
  $stream = new Stream(false, true);
  $images = new Stream(empty());
  $thumbnails = new Stream(empty());

  constructor({ width = 224, height = 224 }: WebcamOptions = {}) {
    super();
    this.#width = width;
    this.#height = height;
    this.start();
  }

  getWidth(): number {
    return this.#width;
  }

  mount(targetId?: string): void {
    const target = document.querySelector(`#${targetId || this.id}`);
    if (!target) return;
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        width: this.#width,
        height: this.#height,
        active: this.$active,
        stream: this.$stream,
        images: this.$images,
        thumbnails: this.$thumbnails,
      },
    });
  }
}
