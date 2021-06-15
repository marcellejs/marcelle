import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './text-field.view.svelte';

export class TextField extends Component {
  title = 'textField';

  $text: Stream<string> = new Stream('', true);

  constructor() {
    super();
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
