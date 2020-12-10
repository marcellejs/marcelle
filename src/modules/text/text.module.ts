import { Module } from '../../core/module';
import Component from './text.svelte';
import { Stream } from '../../core/stream';

export interface TextOptions {
  text: string;
}

export class Text extends Module {
  title = 'text';

  $text: Stream<string>;

  constructor({ text = 'click me' }: Partial<TextOptions> = {}) {
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
        title: this.title,
        text: this.$text,
      },
    });
  }
}
