import { get, writable, Writable, Readable, readable } from 'svelte/store';

interface Instance {
  label: string;
  data: unknown;
  thumbnail?: string;
}

let inputStream: Readable<unknown[]> | Writable<unknown[]>;
export function setInputStream(s: Readable<unknown[]> | Writable<unknown[]>): void {
  inputStream = s;
}
let thumbnailStream: Readable<unknown[]> | Writable<unknown[]>;
export function setThumbnailStream(s: Readable<unknown[]> | Writable<unknown[]>): void {
  thumbnailStream = s;
}

export const capturing = writable(false);
export const temporal = writable(false);
export const label = writable('default');
export const instances = readable<Instance | undefined>(undefined, (set) => {
  let data: unknown[] = [];
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let unsubscribe = () => {};
  capturing.subscribe((c) => {
    if (get(temporal)) {
      if (c) {
        data = [];
        unsubscribe = inputStream.subscribe((frame: unknown[]) => {
          data.push(frame);
        });
      } else {
        unsubscribe();
        const v: Instance = { label: get(label), data };
        if (thumbnailStream) {
          v.thumbnail = get(thumbnailStream);
        }
        set(v);
      }
    } else {
      if (c) {
        unsubscribe = inputStream.subscribe((frame: unknown[]) => {
          const v: Instance = { label: get(label), data: frame };
          if (thumbnailStream) {
            v.thumbnail = get(thumbnailStream);
          }
          set(v);
        });
      } else {
        unsubscribe();
      }
    }
  });
});
