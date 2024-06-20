import type { Stream as MostStream, Disposable, Scheduler, Sink, Time } from '@most/types';
import type { SeedValue } from '@most/core/dist/combinator/loop';
import * as most from '@most/core';
import { asap, newDefaultScheduler } from '@most/scheduler';
import { createAdapter } from '@most/adapter';
import { noop } from '../utils/misc';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function dummySubscriber<T>(value: T): void {
  // Do nothing
}

const scheduler = newDefaultScheduler();

function isMostStream<T>(s: MostStream<T> | unknown): s is MostStream<T> {
  return s && typeof s === 'object' && (s as Stream<T>).run !== undefined;
}

export function isStream<T>(s: Stream<T> | unknown): s is Stream<T> {
  return (
    s &&
    typeof s === 'object' &&
    (s as Stream<T>).run !== undefined &&
    (s as Stream<T>).id !== undefined
  );
}

export class Stream<T> {
  static nextId = 0;
  static numActive = 0;
  id = Stream.nextId++;
  private stream: MostStream<T>;
  private stopStream: (event: undefined) => void;
  private subscribers: Array<(x: T) => void> = [];

  value: T = undefined;
  ready = false;
  #hold: boolean;
  #running = false;
  #startPromise: Promise<void>;

  set: (value: T) => void;

  constructor(s: Stream<T> | MostStream<T> | T, hold: boolean = undefined) {
    this.#hold = !!hold;
    const [stopStream, stopEvents] = createAdapter<undefined>();
    const [induce, events] = createAdapter<T>();
    this.stopStream = stopStream;
    this.set = (v) => {
      this.value = v;
      // Following line is not working for derived streams...
      // if (!hold || this.ready) induce(v);
      induce(v);
    };
    let stream;
    if (isStream<T>(s)) {
      stream = s;
      if (hold === undefined) {
        this.#hold = s.holding;
      }
      if (s.holding) {
        this.value = s.value;
      }
    } else if (isMostStream(s)) {
      stream = s;
    } else {
      stream = most.map(() => this.value, most.now(s));
      this.value = s;
    }
    this.stream = most.multicast(
      most.tap(this.runListeners.bind(this), most.until(stopEvents, most.merge(stream, events))),
    );
  }

  get(): T {
    // if (!this.#hold) {
    //   throw new Error('Cannot get value of a Stream if it was not instantiated with hold=true');
    // }
    return this.value;
  }

  get holding(): boolean {
    return this.#hold;
  }

  run(sink: Sink<T>, s: Scheduler): Disposable {
    return this.stream.run(sink, s);
  }

  private runListeners(value: T) {
    this.value = value;
    for (const listener of this.subscribers) {
      listener(value);
    }
  }

  subscribe(run: (value: T) => void = dummySubscriber, invalidate = noop): () => void {
    if (this.#hold && this.#running) {
      run(this.value);
    }
    const subscriber = (x: T) => {
      invalidate();
      run(x);
    };
    this.subscribers.push(subscriber);
    if (!this.#running) {
      this.start();
    }
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index !== -1) this.subscribers.splice(index, 1);
    };
  }

  async start(): Promise<void> {
    if (!this.#running) {
      Stream.numActive++;

      most.runEffects(this.stream, scheduler).then(() => {
        Stream.numActive--;
      });
      this.#running = true;
      this.#startPromise = new Promise<void>((resolve, reject) => {
        asap(
          {
            run: () => {
              this.ready = true;
              resolve();
            },
            error(e) {
              reject(e);
            },
            dispose() {
              // nothing here.
            },
          },
          scheduler,
        );
      });
    }
    return this.#startPromise;
  }

  stop(): void {
    this.stopStream(undefined);
    this.#running = false;
  }

  hold(h = true): Stream<T> {
    this.#hold = h;
    return this;
  }

  thru<B>(f: (s: Stream<T>) => MostStream<B>): Stream<B> {
    return new Stream<B>(f(this));
  }

  // ------------------------------------
  // Wrap most operators
  // ------------------------------------
  startWith(x: T): Stream<T> {
    const s = new Stream(most.startWith(x, this));
    if (this.holding) {
      s.value = x;
    }
    return s;
  }

  continueWith<U>(f: () => Stream<U>): Stream<T | U> {
    const s = new Stream(most.continueWith(f, this));
    if (this.holding) {
      s.value = this.value;
    }
    return s;
  }

  map<U>(f: (a: T) => U): Stream<U> {
    const s = new Stream(most.map(f, this));
    if (this.holding) {
      s.value = f(this.value);
    }
    return s;
  }

  constant<B>(x: B): Stream<B> {
    const s = new Stream(most.constant(x, this));
    if (this.holding) {
      s.value = x;
    }
    return s;
  }

  tap(f: (a: T) => void): Stream<T> {
    const s = new Stream(most.tap(f, this));
    if (this.holding) {
      s.value = this.value;
    }
    return s;
  }

  ap<B>(fs: Stream<(a: T) => B>): Stream<B> {
    const s = new Stream(most.ap(fs, this));
    if (this.holding && fs.holding) {
      s.value = fs.get()(this.value);
    }
    return s;
  }

  scan<B>(f: (b: B, a: T) => B, initial: B): Stream<B> {
    const s = new Stream(most.scan(f, initial, this));
    if (this.holding) {
      s.value = initial;
    }
    return s;
  }

  loop<B, S>(stepper: (seed: S, a: T) => SeedValue<S, B>, seed: S): Stream<B> {
    return new Stream(most.loop(stepper, seed, this));
  }

  withItems<A>(items: A[]): Stream<A> {
    return new Stream(most.withItems(items, this));
  }

  zipItems<A, C>(f: (a: A, b: T) => C, items: A[]): Stream<C> {
    return new Stream(most.zipItems(f, items, this));
  }

  switchLatest<U>(): Stream<U> {
    return new Stream(most.switchLatest(this as unknown as Stream<Stream<U>>));
  }

  join<U>(): Stream<U> {
    return new Stream(most.join(this as unknown as Stream<Stream<U>>));
  }

  chain<B>(f: (value: T) => Stream<B>): Stream<B> {
    return new Stream(most.chain(f, this));
  }

  concatMap<B>(f: (a: T) => Stream<B>): Stream<B> {
    return new Stream(most.concatMap(f, this));
  }

  mergeConcurrently<U>(concurrency: number): Stream<U> {
    return new Stream(most.mergeConcurrently(concurrency, this as unknown as Stream<Stream<U>>));
  }

  mergeMapConcurrently<B>(f: (a: T) => Stream<B>, concurrency: number): Stream<B> {
    return new Stream(most.mergeMapConcurrently(f, concurrency, this));
  }

  merge<A>(stream1: Stream<A>): Stream<A | T> {
    const s = new Stream(most.merge(stream1, this));
    if (this.holding) {
      s.value = this.value;
    }
    return s;
  }

  combine<A, R>(f: (a: A, b: T) => R, stream1: Stream<A>): Stream<R> {
    const s = new Stream(most.combine(f, stream1, this));
    if (this.holding) {
      s.value = f(stream1.value, this.value);
    }
    return s;
  }

  zip<A, R>(f: (a: A, b: T) => R, stream1: Stream<A>): Stream<R> {
    const s = new Stream(most.zip(f, stream1, this));
    if (this.holding) {
      s.value = f(stream1.value, this.value);
    }
    return s;
  }

  resample<B>(sampler: Stream<B>): Stream<T> {
    return new Stream(most.sample(this, sampler));
  }

  sample<A>(values: Stream<A>): Stream<A> {
    return new Stream(most.sample(values, this));
  }

  snapshot<A, C>(f: (a: A, b: T) => C, values: Stream<A>): Stream<C> {
    return new Stream(most.snapshot(f, values, this));
  }

  filter(p: (a: T) => boolean): Stream<T> {
    const s = new Stream(most.filter(p, this));
    if (this.holding && p(this.value)) {
      s.value = this.value;
    }
    return s;
  }

  skipRepeats(): Stream<T> {
    const s = new Stream(most.skipRepeats(this));
    if (this.holding) {
      s.value = this.value;
    }
    return s;
  }

  skipRepeatsWith(equals: (a1: T, a2: T) => boolean): Stream<T> {
    return new Stream(most.skipRepeatsWith(equals, this));
  }

  slice(start: number, end: number): Stream<T> {
    return new Stream(most.slice(start, end, this));
  }

  take(n: number): Stream<T> {
    return new Stream(most.take(n, this));
  }

  skip(n: number): Stream<T> {
    return new Stream(most.skip(n, this));
  }

  takeWhile(p: (a: T) => boolean): Stream<T> {
    return new Stream(most.takeWhile(p, this));
  }

  skipWhile(p: (a: T) => boolean): Stream<T> {
    return new Stream(most.skipWhile(p, this));
  }

  skipAfter(p: (a: T) => boolean): Stream<T> {
    return new Stream(most.skipAfter(p, this));
  }

  until(endSignal: Stream<unknown>): Stream<T> {
    return new Stream(most.until(endSignal, this));
  }

  since(startSignal: Stream<unknown>): Stream<T> {
    return new Stream(most.since(startSignal, this));
  }

  during(timeWindow: Stream<Stream<unknown>>): Stream<T> {
    return new Stream(most.during(timeWindow, this));
  }

  delay(delayTime: number): Stream<T> {
    return new Stream(most.delay(delayTime, this));
  }

  withLocalTime(origin: Time): Stream<T> {
    return new Stream(most.withLocalTime(origin, this));
  }

  throttle(period: number): Stream<T> {
    return new Stream(most.throttle(period, this));
  }

  debounce(period: number): Stream<T> {
    return new Stream(most.debounce(period, this));
  }

  awaitPromises(): Stream<Awaited<T>> {
    return new Stream(most.awaitPromises(this as unknown as Stream<Promise<Awaited<T>>>));
  }

  recoverWith<A, E extends Error>(f: (error: E) => Stream<A>): Stream<T | A> {
    return new Stream(most.recoverWith(f, this));
  }

  static empty(): Stream<never> {
    return new Stream(most.empty());
  }

  static never(): Stream<never> {
    return new Stream(most.never());
  }

  static now<A>(x: A): Stream<A> {
    return new Stream(most.now(x));
  }

  static at<A>(t: Time, x: A): Stream<A> {
    return new Stream(most.at(t, x));
  }

  static periodic(period: number): Stream<void> {
    return new Stream(most.periodic(period));
  }

  static throwError(e: Error): Stream<never> {
    return new Stream(most.throwError(e));
  }
}

export function createStream<T>(s: MostStream<T> | T, hold = false): Stream<T> {
  return new Stream(s, hold);
}
