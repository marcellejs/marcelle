import { BehaviorSubject } from 'rxjs';
import { Component, rxBind } from '@marcellejs/core';
import View from './toggle.view.svelte';
import { mount } from "svelte";

export class Toggle extends Component {
  title = 'toggle';

  $text: BehaviorSubject<string>;
  $checked = new BehaviorSubject(false);
  $disabled = new BehaviorSubject(false);

  constructor(text = 'toggle me') {
    super();
    this.$text = new BehaviorSubject(text);
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = mount(View, {
          target: t,
          props: {
            text: this.$text,
            checked: rxBind(this.$checked),
            disabled: this.$disabled,
          },
        });
  }
}
