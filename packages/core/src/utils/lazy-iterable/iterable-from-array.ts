import { LazyIterable } from '../../utils/lazy-iterable/lazy-iterable';

export class ArrayIterable<T> extends LazyIterable<T> {
  constructor(array: Array<T>) {
    super(async function* () {
      for (const x of array) {
        yield x;
      }
    });
  }
}

export function iterableFromArray<T>(arr: Array<T>): ArrayIterable<T> {
  return new ArrayIterable(arr);
}
