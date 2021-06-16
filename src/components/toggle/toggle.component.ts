import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './toggle.view.svelte';

export interface ToggleOptions {
  text: string;
}

export class Toggle extends Component {
  title = 'toggle';

  $text: Stream<string>;
  $checked = new Stream(false, true);
  $disabled = new Stream(false, true);

  constructor({ text = 'toggle me' }: Partial<ToggleOptions> = {}) {
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
        checked: this.$checked,
        disabled: this.$disabled,
      },
    });
  }
}
