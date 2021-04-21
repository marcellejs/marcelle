/*
 * This is a modification of Itiriri-Async:
 * https://github.com/labs42io/itiriri-async/
 */

export function zip<TLeft, TRight>(
  source: () => AsyncIterable<TLeft>,
  others: () => AsyncIterable<TRight>,
): () => AsyncIterable<[TLeft, TRight]> {
  return async function* () {
    const rightIterator = others()[Symbol.asyncIterator]();
    for await (const leftValue of source()) {
      const right = await rightIterator.next();
      if (right.done) return;
      yield [leftValue, right.value];
    }
  };
}
