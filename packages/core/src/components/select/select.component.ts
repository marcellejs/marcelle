import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './select.view.svelte';

export class Select extends Component {
  title = 'select';

  $options: Stream<string[]>;
  $value: Stream<string>;

  constructor(options: string[], value?: string) {
    super();
    this.$options = new Stream(options, true);
    this.$value = new Stream(value !== undefined ? value : options[0], true);
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
        options: this.$options,
        value: this.$value,
      },
    });
  }
}
