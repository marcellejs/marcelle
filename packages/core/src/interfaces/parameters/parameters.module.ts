import { Module } from '../../core/module';
import Component from './parameters.svelte';

export interface Parametrable {
  parameters: Record<string, unknown>;
}

export class Parameters extends Module {
  name = 'parameters';
  description = 'just parameters...';

  #module: Parametrable;

  constructor(m: Parametrable) {
    super();
    this.#module = m;
  }

  mount(targetId?: string): void {
    const target = document.querySelector(`#${targetId || this.id}`);
    if (!target) return;
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        parameters: this.#module.parameters,
      },
    });
  }
}
