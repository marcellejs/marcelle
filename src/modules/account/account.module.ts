import { Module } from '../../core/module';
import Component from './account.svelte';
import { Backend } from '../../backend';

export class Account extends Module {
  name = 'account manager';
  description = 'Account manager';

  #backend: Backend;

  constructor(backend: Backend) {
    super();
    this.#backend = backend;
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        backend: this.#backend,
      },
    });
  }
}
