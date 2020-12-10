import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import Component from './textfield.svelte';

export class Textfield extends Module {
  title = 'textfield';

  $text: Stream<string> = new Stream('', true);

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
        title: this.title,
        text: this.$text,
      },
    });
  }
}
