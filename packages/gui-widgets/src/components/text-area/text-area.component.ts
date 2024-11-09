import { BehaviorSubject } from 'rxjs';
import { Component, rxBind } from '@marcellejs/core';
import View from './text-area.view.svelte';
import { mount, unmount } from 'svelte';

export class TextArea extends Component {
  title = 'text area';

  $value: BehaviorSubject<string>;
  placeholder: string;
  $disabled = new BehaviorSubject(false);

  constructor(defaultValue = '', placeholder = '') {
    super();
    this.$value = new BehaviorSubject(defaultValue);
    this.placeholder = placeholder;
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        value: rxBind(this.$value),
        placeholder: this.placeholder,
        disabled: this.$disabled,
      },
    });
    return () => unmount(app);
  }
}
