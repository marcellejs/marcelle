import { Model } from '../../core';
import { Module } from '../../core/module';
import Component from './progress.svelte';

export class Progress<T, U> extends Module {
  title = 'progress';

  #model: Model<T, U>;

  constructor(m: Model<T, U>) {
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
