import { writable } from 'svelte/store';

const active = writable(false);
const cameras = writable<string[]>([]);
const width = writable(400);
const height = writable(300);

export { active, cameras, width, height };
