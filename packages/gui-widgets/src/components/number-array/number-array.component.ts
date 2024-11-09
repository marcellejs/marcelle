import { BehaviorSubject } from 'rxjs';
import { Component, rxBind } from '@marcellejs/core';
import View from './number-array.view.svelte';
import { mount } from "svelte";

export class NumberArray extends Component {
  title = 'number array';

  $value = new BehaviorSubject<number[]>([]);
  $disabled = new BehaviorSubject<boolean>(false);

  constructor(defaultValue?: number[]) {
    super();
    if (defaultValue !== undefined) {
      this.$value.next(defaultValue);
    }
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = mount(View, {
          target: t,
          props: {
            value: rxBind(this.$value),
            disabled: this.$disabled,
          },
        });
  }
}
