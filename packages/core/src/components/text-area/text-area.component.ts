import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './text-area.view.svelte';

export class TextArea extends Component {
  title = 'text area';

  $value: Stream<string>;
  placeholder: string;
  $disabled: Stream<boolean> = new Stream<boolean>(false, true);

  constructor(defaultValue = '', placeholder = '') {
    super();
    this.$value = new Stream(defaultValue, true);
    this.placeholder = placeholder;
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
        placeholder: this.placeholder,
        disabled: this.$disabled,
      },
    });
  }
}
