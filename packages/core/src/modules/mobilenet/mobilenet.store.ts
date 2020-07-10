import { writable, Writable } from 'svelte/store';

class MobilenetStore {
  features: Writable<unknown>;

  constructor() {
    this.features = writable(undefined);
  }
}

export function createStore(): MobilenetStore {
  return new MobilenetStore();
}
