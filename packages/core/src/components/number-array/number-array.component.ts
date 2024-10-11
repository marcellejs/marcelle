import { BehaviorSubject } from 'rxjs';
import { Component } from '../../core/component';
import View from './number-array.view.svelte';
import { rxBind } from '../../utils/rxjs';

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
    this.$$.app = new View({
      target: t,
      props: {
        value: rxBind(this.$value),
        disabled: this.$disabled,
      },
    });
  }
}
