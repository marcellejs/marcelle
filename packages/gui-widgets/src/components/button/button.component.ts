import { BehaviorSubject, Subject, skip } from 'rxjs';
import { Component } from '@marcellejs/core';
import View from './button.view.svelte';
import { mount } from 'svelte';

export class Button extends Component {
  title = 'button';

  $text: BehaviorSubject<string>;
  $click = new Subject<Event>();
  $pressed = new BehaviorSubject(false);
  $disabled = new BehaviorSubject(false);
  $type = new BehaviorSubject<'default' | 'success' | 'warning' | 'danger'>('default');

  constructor(text = 'click me') {
    super();
    this.$text = new BehaviorSubject(text);
    this.$loading.pipe(skip(1)).subscribe((loading) => {
      this.$disabled.next(loading);
    });
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = mount(View, {
      target: t,
      props: {
        text: this.$text,
        pressed: this.$pressed,
        disabled: this.$disabled,
        type: this.$type,
        onclick: (e: Event) => {
          this.$click.next(e);
        },
      },
    });
  }
}
