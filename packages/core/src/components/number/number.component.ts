import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './number.view.svelte';

export class Number extends Component {
  title = 'number';

  $value = new Stream<number>(0, true);
  $disabled: Stream<boolean> = new Stream<boolean>(false, true);

  constructor(defaultValue?: number) {
    super();
    if (defaultValue !== undefined) {
      this.$value.set(defaultValue);
    }
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
        value: this.$value,
        disabled: this.$disabled,
      },
    });
  }
}
