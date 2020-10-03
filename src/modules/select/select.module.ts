import { Module } from '../../core/module';
import Component from './select.svelte';
import { Stream } from '../../core/stream';

export interface SelectOptions {
  options: string[];
  value?: string;
}

export class Select extends Module {
  name = 'select';
  description = 'just a select...';

  $options: Stream<string[]>;
  $value: Stream<string>;

  constructor({ options = [], value = undefined }: Partial<SelectOptions> = {}) {
    super();
    this.$options = new Stream(options, true);
    this.$value = new Stream(value !== undefined ? value : options[0], true);
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
        options: this.$options,
        value: this.$value,
      },
    });
  }
}
