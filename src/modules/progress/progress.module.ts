import { Module } from '../../core/module';
import Component from './progress.svelte';
import { MLP } from '../mlp';

export class Progress extends Module {
  name = 'progress';

  #model: MLP;

  constructor(m: MLP) {
    super();
    this.#model = m;
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        training: this.#model.$training,
      },
    });
  }
}
