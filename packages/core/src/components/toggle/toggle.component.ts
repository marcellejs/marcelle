import { BehaviorSubject } from 'rxjs';
import { Component } from '../../core/component';
import View from './toggle.view.svelte';
import { rxBind } from '../../utils/rxjs';

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
    this.$$.app = new View({
      target: t,
      props: {
        text: this.$text,
        checked: rxBind(this.$checked),
        disabled: this.$disabled,
      },
    });
  }
}
