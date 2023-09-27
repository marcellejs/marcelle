import { BehaviorSubject } from 'rxjs';
import { Component } from '../../core/component';
import View from './number.view.svelte';
import { rxBind } from '../../utils/rxjs';

export class Number extends Component {
  title = 'number';

  $value = new BehaviorSubject(0);
  $disabled = new BehaviorSubject<boolean>(false);

  constructor(defaultValue?: number) {
    super();
    if (defaultValue !== undefined) {
      this.$value.next(defaultValue);
    }
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        value: rxBind(this.$value),
        disabled: this.$disabled,
      },
    });
  }
}
