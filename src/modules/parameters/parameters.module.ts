import { Module } from '../../core/module';
import Component from './parameters.svelte';
import { Parametrable } from '../../core/types';

export class Parameters extends Module {
  title = 'parameters';

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
