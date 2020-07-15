import { runEffects, multicast, until, tap, merge, now } from '@most/core';
import { newDefaultScheduler } from '@most/scheduler';
import { createAdapter } from '@most/adapter';
import { Stream as MostStream, Disposable, Scheduler, Sink } from '@most/types';
import { noop } from 'svelte/internal';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function dummySubscriber<T>(value: T): void {
  // eslint-disable-line @typescript-eslint/no-empty-function
}

const scheduler = newDefaultScheduler();

function isMostStream<T>(s: MostStream<T> | unknown): s is MostStream<T> {
  return (s as Stream<T>).run !== undefined;
}

export function isStream<T>(s: Stream<T> | T): s is Stream<T> {
  return (s as Stream<T>).id !== undefined && (s as Stream<T>).run !== undefined;
}

export class Stream<T> {
  static nextId = 0;
  static numActive = 0;
  id = Stream.nextId++;
  private stream: MostStream<T>;
  private stopStream: (event: undefined) => void;
  private subscribers: Array<(x: T) => void> = [];
  private running = false;

  value: T = undefined;
  #hasValue = false;
  #hold: boolean;

  set: (value: T) => void;

  constructor(s: MostStream<T> | T, hold = false) {
    this.#hold = hold;
    const [stopStream, stopEvents] = createAdapter<undefined>();
    const [induce, events] = createAdapter<T>();
    this.stopStream = stopStream;
    this.set = induce;
    const stream = isMostStream(s) ? s : now(s);
    if (!isMostStream(s)) {
      this.value = s;
      this.#hasValue = true;
    }
    this.stream = multicast(
      tap(this.runListeners.bind(this), until(stopEvents, merge(stream, events))),
    );
  }

  run(sink: Sink<T>, s: Scheduler): Disposable {
    return this.stream.run(sink, s);
  }

  private runListeners(value: T) {
    this.value = value;
    this.#hasValue = true;
    this.subscribers.forEach((listener) => {
      listener(value);
    });
  }

  subscribe(run: (value: T) => void = dummySubscriber, invalidate = noop): () => void {
    if (this.#hold && this.running && this.#hasValue) {
      run(this.value);
    }
    const subscriber = (x: T) => {
      invalidate();
      run(x);
    };
    this.subscribers.push(subscriber);
    if (!this.running) {
      this.start();
    }
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index !== -1) this.subscribers.splice(index, 1);
    };
  }

  start(): void {
    if (!this.running) {
      Stream.numActive++;
      runEffects(this.stream, scheduler).then(() => {
        Stream.numActive--;
      });
      this.running = true;
    }
  }

  stop(): void {
    this.stopStream(undefined);
    this.running = false;
  }
}
