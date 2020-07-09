import { writable, Writable } from 'svelte/store';

class WebcamStore {
  active: Writable<boolean>;
  stream: Writable<boolean>;
  cameras: Writable<string[]>;
  tensors: Writable<unknown>;
  thumbnails: Writable<string>;

  constructor() {
    this.active = writable(false);
    this.stream = writable(false);
    this.cameras = writable<string[]>([]);
    this.tensors = writable(undefined);
    this.thumbnails = writable('');
  }
}

export function createStore(): WebcamStore {
  return new WebcamStore();
}
