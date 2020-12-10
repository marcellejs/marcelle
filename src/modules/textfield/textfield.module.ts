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
