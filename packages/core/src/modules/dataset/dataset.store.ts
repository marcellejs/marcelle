import { Writable, Readable } from 'svelte/store';

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

const instances: { [id: number]: Instance } = {};

// eslint-disable-next-line @typescript-eslint/no-empty-function
let unsubscribe = () => {};
export function setInstanceStream(s: Stream<Instance>): void {
  unsubscribe();
  unsubscribe = s.subscribe((instance: Instance) => {
    const id = nextId();
    instance.id = id;
    instances[id] = instance;
    console.log('[dataset store] instances', instances);
  });
}
