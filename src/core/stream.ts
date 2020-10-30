import * as most from '@most/core';
import { asap, newDefaultScheduler } from '@most/scheduler';
import { createAdapter } from '@most/adapter';
import { Stream as MostStream, Disposable, Scheduler, Sink, Time } from '@most/types';
import { SeedValue } from '@most/core/dist/combinator/loop';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function dummySubscriber<T>(value: T): void {
  // eslint-disable-line @typescript-eslint/no-empty-function
}

const scheduler = newDefaultScheduler();

function isMostStream<T>(s: MostStream<T> | unknown): s is MostStream<T> {
  return s && typeof s === 'object' && (s as Stream<T>).run !== undefined;
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

  value: T = undefined;
  ready = false;
  #hasValue = false;
  #hold: boolean;
  #running = false;
  #startPromise: Promise<undefined>;

  set: (value: T) => void;

  constructor(s: MostStream<T> | T, hold = false) {
    this.#hold = hold;
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
    if (isMostStream(s)) {
      stream = s;
    } else {
      stream = most.map(() => this.value, most.now(s));
      this.value = s;
      this.#hasValue = true;
    }
    this.stream = most.multicast(
      most.tap(this.runListeners.bind(this), most.until(stopEvents, most.merge(stream, events))),
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

  subscribe(run: (value: T) => void = dummySubscriber, invalidate = () => {}): () => void {
    if (this.#hold && this.#running && this.#hasValue) {
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

  async start(): Promise<undefined> {
    if (!this.#running) {
      Stream.numActive++;
      // console.log('active streams: ', Stream.numActive);
      most.runEffects(this.stream, scheduler).then(() => {
        Stream.numActive--;
        // console.log('active streams: ', Stream.numActive);
      });
      this.#running = true;
      this.#startPromise = new Promise((resolve, reject) => {
        asap(
          {
            run: () => {
              this.ready = true;
              resolve();
            },
            error(e) {
              reject(e);
            },
            dispose() {},
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

  hold(): Stream<T> {
    this.#hold = true;
    return this;
  }

  thru<B>(f: (s: Stream<T>) => MostStream<B>): Stream<B> {
    return new Stream<B>(f(this));
  }

  // ------------------------------------
  // Wrap most operators
  // ------------------------------------
  startWith(x: T): Stream<T> {
    return new Stream(most.startWith(x, this));
  }

  continueWith<U>(f: () => Stream<U>): Stream<T | U> {
    return new Stream(most.continueWith(f, this));
  }

  map<U>(f: (a: T) => U): Stream<U> {
    return new Stream(most.map(f, this));
  }

  constant<B>(x: B): Stream<B> {
    return new Stream(most.constant(x, this));
  }

  tap(f: (a: T) => void): Stream<T> {
    return new Stream(most.tap(f, this));
  }

  ap<B>(fs: Stream<(a: T) => B>): Stream<B> {
    return new Stream(most.ap(fs, this));
  }

  scan<B>(f: (b: B, a: T) => B, initial: B): Stream<B> {
    return new Stream(most.scan(f, initial, this));
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
    return new Stream(most.switchLatest((this as unknown) as Stream<Stream<U>>));
  }

  join<U>(): Stream<U> {
    return new Stream(most.join((this as unknown) as Stream<Stream<U>>));
  }

  chain<B>(f: (value: T) => Stream<B>): Stream<B> {
    return new Stream(most.chain(f, this));
  }

  concatMap<B>(f: (a: T) => Stream<B>): Stream<B> {
    return new Stream(most.concatMap(f, this));
  }

  mergeConcurrently<U>(concurrency: number): Stream<U> {
    return new Stream(most.mergeConcurrently(concurrency, (this as unknown) as Stream<Stream<U>>));
  }

  mergeMapConcurrently<B>(f: (a: T) => Stream<B>, concurrency: number): Stream<B> {
    return new Stream(most.mergeMapConcurrently(f, concurrency, this));
  }

  merge<A>(stream1: Stream<A>): Stream<A | T> {
    return new Stream(most.merge(stream1, this));
  }

  combine<A, R>(f: (a: A, b: T) => R, stream1: Stream<A>): Stream<R> {
    return new Stream(most.combine(f, stream1, this));
  }

  zip<A, R>(f: (a: A, b: T) => R, stream1: Stream<A>): Stream<R> {
    return new Stream(most.zip(f, stream1, this));
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
    return new Stream(most.filter(p, this));
  }

  skipRepeats(): Stream<T> {
    return new Stream(most.skipRepeats(this));
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

  awaitPromises<A>(): Stream<A> {
    return new Stream(most.awaitPromises((this as unknown) as Stream<Promise<A>>));
  }

  recoverWith<A, E extends Error>(f: (error: E) => Stream<A>): Stream<T | A> {
    return new Stream(most.recoverWith(f, this));
  }

  // static periodic(period: number): Stream<void> {
  //   return new Stream(most.periodic(period));
  // }
}

export function createStream<T>(s: MostStream<T> | T, hold = false): Stream<T> {
  return new Stream(s, hold);
}
