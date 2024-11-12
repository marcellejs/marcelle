import { BehaviorSubject } from 'rxjs';
import { Component } from '@marcellejs/core';
import View from './text.view.svelte';
import { mount, unmount } from 'svelte';

export class Text extends Component {
  title = 'text';

  $value: BehaviorSubject<string>;

  constructor(initial = 'click me') {
    super();
    this.$value = new BehaviorSubject(initial);
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        text: this.$value,
      },
    });
    return () => unmount(app);
  }
}
