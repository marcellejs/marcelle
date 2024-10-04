import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './text-input.view.svelte';

export class TextInput extends Component {
  title = 'text input';

  $value = new Stream<string>('', true);
  $disabled: Stream<boolean> = new Stream<boolean>(false, true);

  constructor(defaultValue?: string) {
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
