import { writable } from 'svelte/store';

const click = writable<unknown>(undefined);

export { click };
