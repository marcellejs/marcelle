import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './text.view.svelte';

export interface TextOptions {
  text: string;
}

export class Text extends Component {
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
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        text: this.$text,
      },
    });
  }
}
