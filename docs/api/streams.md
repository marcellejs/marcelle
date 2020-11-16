---
sidebarDepth: 2
---

# Streams

In order to facilitate the conception of custom processing pipelines, modules rely on a reactive programming paradigm to generate or react to particular event streams. The reactive programming is well-suited for the development of such event-driven and interactive applications. It facilitates the management of asynchronous data streams, their transformation and the propagation of change to the relevant dependents.
Each module exposes a set of data streams containing the various events produced by the module. These data streams can easily be manipulated (filtered, transformed, combined) and plugged into other modules to define pipelines.

## Elements of reactive programming

From André Staltz's [The introduction to Reactive Programming you've been missing](https://gist.github.com/staltz/868e7e9bc2a7b8c1f754):

> **Reactive programming is programming with asynchronous data streams.**
>
> In a way, this isn't anything new. Event buses or your typical click events are really an asynchronous event stream, on which you can observe and do some side effects. Reactive is that idea on steroids. You are able to create data streams of anything, not just from click and hover events. Streams are cheap and ubiquitous, anything can be a stream: variables, user inputs, properties, caches, data structures, etc. For example, imagine your Twitter feed would be a data stream in the same fashion that click events are. You can listen to that stream and react accordingly.
>
> **On top of that, you are given an amazing toolbox of functions to combine, create and filter any of those streams.**
>
> That's where the "functional" magic kicks in. A stream can be used as an input to another one. Even multiple streams can be used as inputs to another stream. You can merge two streams. You can filter a stream to get another one that has only those events you are interested in. You can map data values from one stream to another new one.

Schematically, a stream looks like this:

![Schematic representation of a data stream](./images/stream.jpg)

A stream is sequence of ongoing events ordered in time. Streams can be finite or infinite. A Stream's event can be a value, an error or an end signal that indicates the streams has ended.

_Marcelle_ relies on a reactive programming library called [Most.js](https://github.com/mostjs/core).
While _RxJS_ is certainly the most popular JavaScript reactive programing library, _Most.js_ offers high performance and explicit time representation.

All _Most.js_ operators are documented online: [https://mostcore.readthedocs.io/en/latest/](https://mostcore.readthedocs.io/en/latest/)

::: warning TODO
Add resources about reactive programming (tutorials, etc)
:::

## Stream

Marcelle's main Stream class is a wrapper around [Most.js](https://github.com/mostjs/core) streams, designed to:

- facilitate the integration with Svelte components
- allow for impartively pushing events (like RxJs's `Subject`)
- allow for holding values (like RxJs's `BehaviorSubject`)
- offer a fluent API using [@most/fluent](https://github.com/mostjs/x-fluent)

The following factory function creates and returns a Marcelle Stream from a Most.js Stream:

```tsx
createStream<T>(s: MostStream<T> | T, hold: boolean): Stream<T>
```

#### Parameters

| Option | Type                 | Description                                                                                                                                                             | Required |
| ------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| s      | MostStream\<T\> \| T | A stream from the most library, or a value                                                                                                                              |    ✓     |
| hold   | boolean              | If true, the last event is stored and delivered to each new oserver. This uses [@most/hold](https://github.com/mostjs/hold), and is similar to RxJs's `BehaviorSubject` |          |

#### Example

```js
const $timer = marcelle.createStream(mostCore.periodic(500));
const $rnd = $timer
  .map(() => Math.random())
  .filter((x) => x > 0.5)
  .map((x) => (x - 0.5) * 1000));
$rnd.subscribe(console.log);
```

### .hold()

```tsx
hold(): Stream<T>
```

Hold the stream values. When called, all new subscribers will receive the latest value at the time of subscription.

### .start()

```tsx
start(): void
```

Start the stream processing, even if no subscriber has been registered. This method is called automatically on `subscribe`.

### .stop()

```tsx
stop(): void
```

Imperatively stop the stream processing. Calling `stop` will result in an `end` event being emitted on the stream.

### .subscribe()

```tsx
subscribe(run: (value: T) => void = dummySubscriber, invalidate = () => {}): () => void
```

The `subscribe` method must accept as its argument a subscription function. All of a streams's active subscription functions are synchronously called whenever a new event is emitted on the stream. If a stream is held, this subscription function must be immediately and synchronously called with the stream's current value upon calling `subscribe`.

### .thru()

```tsx
thru<B>(f: (s: Stream<T>) => MostStream<B>): Stream<B>
```

Apply functions fluently to a Stream, wrapping the result in a new Stream. Use thru when you want to continue dot-chaining other Stream operations.
