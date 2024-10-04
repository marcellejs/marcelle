/*
 * This is a modification of Itiriri-Async:
 * https://github.com/labs42io/itiriri-async/
 */

import { concat, filter, forEach, map, skip, take, toArray } from './iterators';
import { zip } from './combinators';
import { reduce } from './reducers';

export function isIterable<T>(item: unknown): item is Iterable<T> {
  return typeof (item as Iterable<T>)[Symbol.iterator] === 'function';
}

export function isAsyncIterable<T>(item: unknown): item is AsyncIterable<T> {
  return typeof (item as AsyncIterable<T>)[Symbol.asyncIterator] === 'function';
}

export class LazyIterable<T> implements AsyncIterable<T> {
  constructor(private readonly source: () => AsyncIterable<T>) {}

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return this.source()[Symbol.asyncIterator]();
  }

  entries(): LazyIterable<[number, T]> {
    return new LazyIterable(map(this.source, (elem, idx) => [idx, elem]));
  }

  keys(): LazyIterable<number> {
    return new LazyIterable(map(this.source, (_, idx) => idx));
  }

  values(): LazyIterable<T> {
    return new LazyIterable(this.source);
  }

  forEach(action: (element: T, index: number) => void): Promise<void> {
    return forEach(this.source, action);
  }

  concat(other: T | Promise<T> | Iterable<T> | AsyncIterable<T>): LazyIterable<T> {
    if (isIterable(other)) {
      return new LazyIterable(
        concat(
          this.source,
          (async function* (e) {
            yield* e;
          })(other),
        ),
      );
    }
    return isAsyncIterable(other)
      ? new LazyIterable(concat(this.source, other))
      : new LazyIterable(
          concat(
            this.source,
            (async function* (e) {
              yield e;
            })(other),
          ),
        );
  }

  reduce(callback: (accumulator: T, current: T, index: number) => T): Promise<T>;
  reduce<TAccumulator>(
    callback: (accumulator: TAccumulator, current: T, index: number) => TAccumulator,
    initialValue: TAccumulator,
  ): Promise<TAccumulator>;
  reduce<TResult>(
    callback: (accumulator: TResult | T, current: T, index: number) => TResult,
    initialValue?: TResult,
  ): Promise<TResult> {
    return reduce(this.source, callback, initialValue);
  }

  filter(predicate: (element: T, index: number) => boolean): LazyIterable<T> {
    return new LazyIterable(filter(this.source, predicate));
  }

  take(count: number): LazyIterable<T> {
    return new LazyIterable(take(this.source, count));
  }

  skip(count: number): LazyIterable<T> {
    return new LazyIterable(skip(this.source, count));
  }

  map<S>(selector: (element: T, index: number) => S): LazyIterable<S> {
    return new LazyIterable(map(this.source, selector));
  }

  zip<TRight>(other: () => AsyncIterable<TRight>): LazyIterable<[T, TRight]> {
    return new LazyIterable(zip(this.source, other));
  }

  toArray(): Promise<T[]> {
    return toArray(this.source);
  }
}
