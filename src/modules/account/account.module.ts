import { Module } from '../../core/module';
import Component from './account.svelte';
import { DataStore } from '../../data-store';

export class Account extends Module {
  title = 'account manager';

  #dataStore: DataStore;

  constructor(dataStore: DataStore) {
    super();
    this.#dataStore = dataStore;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        dataStore: this.#dataStore,
      },
    });
  }
}
