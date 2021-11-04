import { never } from '@most/core';
import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './button.view.svelte';

export class Button extends Component {
  title = 'button';

  $text: Stream<string>;
  $click = new Stream<CustomEvent<unknown>>(never());
  $pressed = new Stream(false, true);
  $loading = new Stream(false, true);
  $disabled: Stream<boolean> = new Stream<boolean>(false, true);
  $type = new Stream<'default' | 'success' | 'warning' | 'danger'>('default', true);

  constructor(text = 'click me') {
    super();
    this.$text = new Stream(text, true);
    this.start();
    this.$loading.skip(1).subscribe((loading) => {
      this.$disabled.set(loading);
    });
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
        pressed: this.$pressed,
        loading: this.$loading,
        disabled: this.$disabled,
        type: this.$type,
      },
    });
    this.$$.app.$on('click', this.$click.set);
  }
}
