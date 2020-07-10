import { writable, readable } from 'svelte/store';

export const size = writable(32);

export const frames = readable<number[]>(
  Array.from(Array(32), () => Math.random()),
  (set) => {
    let currentSize = 32;
    size.subscribe((s) => {
      currentSize = s;
    });
    const interval = setInterval(() => {
      set(Array.from(Array(currentSize), () => Math.random()));
    }, 1000);

    return function stop() {
      clearInterval(interval);
    };
  },
);
