import { empty } from '@most/core';
import { Module } from '../../core/module';
import Component from './button.svelte';
import { Stream } from '../../core/stream';

export interface ButtonOptions {
  text: string;
}

export class Button extends Module {
  name = 'button';
  description = 'just a button...';

  $text: Stream<string>;
  $click = new Stream(empty());
  $down = new Stream(false, true);
  $loading = new Stream(false, true);

  constructor({ text = 'click me' }: Partial<ButtonOptions> = {}) {
    super();
    this.$text = new Stream(text, true);
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
        text: this.$text,
        down: this.$down,
        loading: this.$loading,
      },
    });
    this.$$.app.$on('click', this.$click.set);
  }
}
