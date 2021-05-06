import { Module } from '../../core/module';
import Component from './model-parameters.svelte';
import { Parametrable } from '../../core/types';

export class ModelParameters extends Module {
  title = 'modelParameters';

  #module: Parametrable;

  constructor(m: Parametrable) {
    super();
    this.#module = m;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        parameters: this.#module.parameters,
      },
    });
  }
}
