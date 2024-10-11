import { BehaviorSubject } from 'rxjs';
import { Component } from '../../core/component';
import View from './text.view.svelte';

export class Text extends Component {
  title = 'text';

  $value: BehaviorSubject<string>;

  constructor(initial = 'click me') {
    super();
    this.$value = new BehaviorSubject(initial);
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        text: this.$value,
      },
    });
  }
}
