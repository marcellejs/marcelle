import type { Model } from '../../core';
import { Component } from '../../core/component';
import View from './training-progress.view.svelte';

export class TrainingProgress<T, U> extends Component {
  title = 'training progress';

  #model: Model<T, U>;

  constructor(m: Model<T, U>) {
    super();
    this.#model = m;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        training: this.#model.$training,
      },
    });
  }
}
