import { writable, Writable, Readable, derived, get } from 'svelte/store';

export interface Instance {
  id?: number;
  label: string;
  data: unknown;
  thumbnail?: string;
}
export type Stream<T> = Readable<T> | Writable<T>;

let staticId = 0;
function nextId() {
  return staticId++;
}

export const instances = writable<Instance[]>([]);

// eslint-disable-next-line @typescript-eslint/no-empty-function
let unsubscribe = () => {};
export function setInstanceStream(s: Stream<Instance>): void {
  unsubscribe();
  unsubscribe = s.subscribe((instance: Instance) => {
    if (!instance) return;
    const id = nextId();
    instance.id = id;
    instances.set([...get(instances), instance]);
  });
}

export const count = derived(instances, ($x) => Object.keys($x).length);
