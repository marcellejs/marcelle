import { writable } from 'svelte/store';

const text = writable<string>('click me');
const click = writable<unknown>(undefined);

export { click, text };
