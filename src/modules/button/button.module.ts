import { never } from '@most/core';
import { Module } from '../../core/module';
import Component from './button.svelte';
import { Stream } from '../../core/stream';

export interface ButtonOptions {
  text: string;
}

export class Button extends Module {
  title = 'button';

  $text: Stream<string>;
  $click = new Stream<CustomEvent<unknown>>(never());
  $down = new Stream(false, true);
  $loading = new Stream(false, true);
  $disabled: Stream<boolean>;
  $type = new Stream('deafult', true);

  constructor({ text = 'click me' }: Partial<ButtonOptions> = {}) {
    super();
    this.$text = new Stream(text, true);
    this.$disabled = new Stream(this.$loading, true);
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
        text: this.$text,
        down: this.$down,
        loading: this.$loading,
        disabled: this.$disabled,
        type: this.$type,
      },
    });
    this.$$.app.$on('click', this.$click.set);
  }
}
