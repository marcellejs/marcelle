import type { DataStore } from '../../core/data-store';
import { Component } from '../../core/component';
import View from './account.view.svelte';
import { mount } from 'svelte';

export class Account extends Component {
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
    this.$$.app = mount(View, {
      target: t,
      props: {
        dataStore: this.#dataStore,
      },
    });
  }
}
