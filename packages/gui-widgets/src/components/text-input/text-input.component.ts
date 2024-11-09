import { BehaviorSubject } from 'rxjs';
import { Component, rxBind } from '@marcellejs/core';
import View from './text-input.view.svelte';
import { mount, unmount } from 'svelte';

export class TextInput extends Component {
  title = 'text input';

  $value = new BehaviorSubject('');
  $disabled = new BehaviorSubject<boolean>(false);

  constructor(defaultValue?: string) {
    super();
    if (defaultValue !== undefined) {
      this.$value.next(defaultValue);
    }
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        value: rxBind(this.$value),
        disabled: this.$disabled,
      },
    });
    return () => unmount(app);
  }
}
