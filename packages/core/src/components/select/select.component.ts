import { BehaviorSubject } from 'rxjs';
import { Component } from '../../core/component';
import View from './select.view.svelte';
import { rxBind } from '../../utils/rxjs';

export class Select extends Component {
  title = 'select';

  $options: BehaviorSubject<string[]>;
  $value: BehaviorSubject<string>;

  constructor(options: string[], value?: string) {
    super();
    this.$options = new BehaviorSubject(options);
    this.$value = new BehaviorSubject(value !== undefined ? value : options[0]);
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        options: this.$options,
        value: rxBind(this.$value),
      },
    });
  }
}
