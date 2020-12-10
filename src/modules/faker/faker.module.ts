import { periodic, map } from '@most/core';
import { Module } from '../../core/module';
import Component from './faker.svelte';
import { Stream } from '../../core/stream';

export interface FakerOptions {
  size?: number;
  period?: number;
}

export class Faker extends Module {
  title = 'faker';

  size: number;

  $frames: Stream<number[]>;

  constructor({ size = 32, period = 1000 }: FakerOptions = {}) {
    super();
    this.size = size;
    this.$frames = new Stream(
      map(() => Array.from(Array(size), () => Math.random()), periodic(period)),
    );
    this.start();
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.title,
        size: this.size,
        frames: this.$frames,
      },
    });
  }
}
