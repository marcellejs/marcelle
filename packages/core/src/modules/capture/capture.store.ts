import { get, writable, Writable, Readable } from 'svelte/store';
import { Observable } from 'rxjs';

interface Instance {
  label: string;
  data: unknown;
  thumbnail?: string;
}
type Stream = Writable<unknown> | Readable<unknown> | Observable<unknown>;

let inputStream: Writable<unknown> | Readable<unknown>;
export function setInputStream(s: Writable<unknown> | Readable<unknown>): void {
  inputStream = s;
}
let thumbnailStream: Stream;
export function setThumbnailStream(s: Stream): void {
  thumbnailStream = s;
}

export const capturing = writable(false);
export const temporal = writable(false);
export const label = writable('default');

// export const instances = new Subject<unknown>();
export const instances = new Observable<unknown>(function subscribe(subscriber) {
  let data: unknown[] = [];
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let unsubscribe = () => {};
  capturing.subscribe((c) => {
    if (get(temporal)) {
      if (c) {
        data = [];
        unsubscribe = inputStream.subscribe((frame: unknown) => {
          data.push(frame);
        });
      } else {
        unsubscribe();
        const v: Instance = { label: get(label), data };
        if (thumbnailStream) {
          v.thumbnail = get(thumbnailStream);
        }
        subscriber.next(v);
      }
    } else {
      if (c) {
        unsubscribe = inputStream.subscribe((frame: unknown) => {
          const v: Instance = { label: get(label), data: frame };
          if (thumbnailStream) {
            v.thumbnail = get(thumbnailStream);
          }
          subscriber.next(v);
        });
      } else {
        unsubscribe();
      }
    }
  });
});

// export const instances = readable<Instance | undefined>(undefined, (set) => {
//   let data: unknown[] = [];
//   // eslint-disable-next-line @typescript-eslint/no-empty-function
//   let unsubscribe = () => {};
//   capturing.subscribe((c) => {
//     if (get(temporal)) {
//       if (c) {
//         data = [];
//         unsubscribe = inputStream.subscribe((frame: unknown[]) => {
//           data.push(frame);
//         });
//       } else {
//         unsubscribe();
//         const v: Instance = { label: get(label), data };
//         if (thumbnailStream) {
//           v.thumbnail = get(thumbnailStream);
//         }
//         set(v);
//       }
//     } else {
//       if (c) {
//         unsubscribe = inputStream.subscribe((frame: unknown[]) => {
//           const v: Instance = { label: get(label), data: frame };
//           if (thumbnailStream) {
//             v.thumbnail = get(thumbnailStream);
//           }
//           set(v);
//         });
//       } else {
//         unsubscribe();
//       }
//     }
//   });
// });
