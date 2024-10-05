import { BehaviorSubject, Subject, skip } from 'rxjs';
import { Component } from '../../core/component';
import View from './button.view.svelte';

export class Button extends Component {
  title = 'button';

  $text: BehaviorSubject<string>;
  $click = new Subject<CustomEvent<unknown>>();
  $pressed = new BehaviorSubject(false);
  $loading = new BehaviorSubject(false);
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
    this.$$.app.$on('click', (e) => {
      this.$click.next(e);
    });
  }
}
