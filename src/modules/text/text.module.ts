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

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        text: this.$text,
      },
    });
  }
}
