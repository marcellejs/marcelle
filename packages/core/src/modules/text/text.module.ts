import { Module } from '../../core/module';
import Component from './text.svelte';
import { Stream } from '../../core/stream';

export interface TextOptions {
  text: string;
}

export class Text extends Module {
  name = 'text';
  description = 'just a text...';

  $text: Stream<string>;

  constructor({ text = 'click me' }: Partial<TextOptions> = {}) {
    super();
    this.$text = new Stream(text, true);
    this.start();
  }

  mount(targetId?: string): void {
    const target = document.querySelector(`#${targetId || this.id}`);
    if (!target) return;
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        text: this.$text,
      },
    });
  }
}
