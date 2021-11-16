import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './text.view.svelte';

export class Text extends Component {
  title = 'text';

  $value: Stream<string>;

  constructor(initial = 'click me') {
    super();
    this.$value = new Stream(initial, true);
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
        text: this.$value,
      },
    });
  }
}
