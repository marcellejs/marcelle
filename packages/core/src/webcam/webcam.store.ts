import { readable, writable } from 'svelte/store';

const timer = readable(0, (set) => {
  let current = 0;

  const id = setInterval(() => {
    current += 1;
    set(current);
  }, 1000);

  return () => clearInterval(id);
});

const active = writable(false);

export { timer, active };
