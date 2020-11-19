import { Module } from '../../core/module';
import Component from './account.svelte';
import { DataStore } from '../../data-store';

export class Account extends Module {
  name = 'account manager';
  description = 'Account manager';

  #dataStore: DataStore;

  constructor(dataStore: DataStore) {
    super();
    this.#dataStore = dataStore;
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        dataStore: this.#dataStore,
      },
    });
  }
}
