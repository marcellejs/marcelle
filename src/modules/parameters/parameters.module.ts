import { Module } from '../../core/module';
import Component from './parameters.svelte';
import { Parametrable } from '../../core/types';

export class Parameters extends Module {
  name = 'parameters';
  description = 'just parameters...';

  #module: Parametrable;

  constructor(m: Parametrable) {
    super();
    this.#module = m;
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        parameters: this.#module.parameters,
      },
    });
  }
}
