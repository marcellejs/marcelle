---
sidebarDepth: 3
---

# Utilities

## Logger

Marcelle provides a `logger` utility to display messages in the user interface and/or the console. When a dashboard is mounted, messages are displayed in the footer.

The logger provides serveral functions taking an arbitrary number of messages, similarly to the `console` object:

```tsx
logger.log(...messages: unknown[]): void;
logger.debug(...messages: unknown[]): void;
logger.info(...messages: unknown[]): void;
logger.warning(...messages: unknown[]): void;
logger.error(...messages: unknown[]): void;
```

#### Example

```ts
import { logger } from '@marcellejs/core';

logger.log('Hello Marcelle!');
logger.error('An error occurred with code', 42);
```

## Notifications

```tsx
function notification({
  title: string;
  message: string;
  duration?: number;
  type?: 'default' | 'danger';
}): void
```

Display a notification on the top-right of the screen.

#### Parameters

| Option   | Type                  | Description                                                                                                 | Required |
| -------- | --------------------- | ----------------------------------------------------------------------------------------------------------- | :------: |
| title    | string                | The notification's title                                                                                    |    ✓     |
| message  | string                | The notification's main message                                                                             |    ✓     |
| duration | number                | The notification's duration in milliseconds. If 0, the notification remains on the screen. Defaults to 3000 |    ✓     |
| type     | 'default' \| 'danger' | The notification's type. Defaults to 'default'                                                              |    ✓     |

#### Example

```ts
import { notification } from '@marcellejs/core';

notification({
  title: 'Tip',
  message: 'You need to have at least two classes to train the model',
  duration: 5000,
});
```

## LazyIterable

A class facilitating the manipulation of _asynchronous iterable_, based on [itiriri](https://github.com/labs42io/itiriri-async/). The interface is as follows:

```ts
export class LazyIterable<T> implements AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncIterator<T>;

  entries(): LazyIterable<[number, T]>;
  keys(): LazyIterable<number>;
  values(): LazyIterable<T>;
  forEach(action: (element: T, index: number) => void): Promise<void>;
  concat(other: T | Promise<T> | Iterable<T> | AsyncIterable<T>): LazyIterable<T>;
  reduce(callback: (accumulator: T, current: T, index: number) => T): Promise<T>;
  reduce<TAccumulator>(
    callback: (accumulator: TAccumulator, current: T, index: number) => TAccumulator,
    initialValue: TAccumulator,
  ): Promise<TAccumulator>;
  reduce<TResult>(
    callback: (accumulator: TResult | T, current: T, index: number) => TResult,
    initialValue?: TResult,
  ): Promise<TResult>;

  filter(predicate: (element: T, index: number) => boolean): LazyIterable<T>;
  take(count: number): LazyIterable<T>;
  skip(count: number): LazyIterable<T>;
  map<S>(selector: (element: T, index: number) => S): LazyIterable<S>;
  zip<TRight>(other: () => AsyncIterable<TRight>): LazyIterable<[T, TRight]>;
  toArray(): Promise<T[]>;
}
```

See [Itiriri's docs](https://github.com/labs42io/itiriri-async/) for details on the methods.
