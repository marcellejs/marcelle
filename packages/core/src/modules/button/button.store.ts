import { writable } from 'svelte/store';

export const text = writable<string>('click me');
export const click = writable<unknown>(undefined);
