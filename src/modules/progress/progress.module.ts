import { Module } from '../../core/module';
import Component from './progress.svelte';
import { MLP } from '../mlp';

export class Progress extends Module {
  title = 'progress';

  #model: MLP;

  constructor(m: MLP) {
    super();
    this.#model = m;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        training: this.#model.$training,
      },
    });
  }
}
