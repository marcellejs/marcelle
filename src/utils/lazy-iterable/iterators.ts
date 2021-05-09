/*
 * This is a modification of Itiriri-Async:
 * https://github.com/labs42io/itiriri-async/
 */

export function filter<TElement>(
  source: () => AsyncIterable<TElement>,
  predicate: (element: TElement, index: number) => boolean,
): () => AsyncIterable<TElement> {
  return async function* () {
    let index = 0;
    for await (const element of source()) {
      if (predicate(element, index++)) {
        yield await element;
      }
    }
  };
}

export function map<TElement, TResult>(
  source: () => AsyncIterable<TElement>,
  transform: (element: TElement, index: number) => TResult,
): () => AsyncIterable<TResult> {
  return async function* () {
    let index = 0;

    for await (const element of source()) {
      yield await transform(element, index++);
    }
  };
}

export function skip<TElement>(
  source: () => AsyncIterable<TElement>,
  count: number,
): () => AsyncIterable<TElement> {
  if (count < 0) {
    throw Error('Negative count is not supported, use await and sync iterator instead.');
  }

  return async function* () {
    yield* filter(source, (_, index) => index >= count)();
  };
}

export function take<TElement>(
  source: () => AsyncIterable<TElement>,
  count: number,
): () => AsyncIterable<TElement> {
  if (count < 0) {
    throw Error('Negative count is not supported, use await and sync iterator instead.');
  }

  return async function* () {
    let n = count;

    for await (const element of source()) {
      if (n-- === 0) return;
      yield await element;
    }
  };
}

export function concat<TElement>(
  left: () => AsyncIterable<TElement>,
  right: AsyncIterable<TElement>,
): () => AsyncIterable<TElement> {
  return async function* () {
    yield* await left();
    yield* await right;
  };
}

export async function forEach<T>(
  source: () => AsyncIterable<T>,
  action: (element: T, index: number) => void,
): Promise<void> {
  let index = 0;
  for await (const element of source()) {
    action(element, index++);
  }
}

export async function toArray<T>(source: () => AsyncIterable<T>): Promise<T[]> {
  const result: T[] = [];
  for await (const element of source()) {
    result.push(element);
  }
  return result;
}
