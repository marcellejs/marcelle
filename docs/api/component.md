---
sidebarDepth: 3
---

# Component API

Components are the building blocks of a Marcelle application and handle various tasks such as capturing images from a webcam, defining a new dataset, instancing a Deep Neural Network (DNN), displaying a confusion matrix, or monitoring the confidence of a model prediction, to name a few. Because Marcelle emphasizes instant feedback and user interaction, components often provide a graphical user interface that can be displayed on demand in a web application.

The specification of components is somehow loose in the library, to allow for easy customization and extension. A component is essentially a JavaScript object exposing a set of reactive streams and providing a `mount` method for displaying their associated view. All components have a string property called `title` used as title for the cards displayed in a dashboard. Each component instance also carries a unique `id`.

The minimal TypeScript interface corresponding to a component is as follows:

```ts
interface Component {
  title: string; // component name
  id: string; // component id (unique per instance)
  mount(targetSelector?: string): void; // mount the component's view in the DOM
  destroy(): void; // destroy the component's view
}
```

## Member Streams

While components have heterogeneous purposes, their unified interface makes it easy for developers to link together various parts of the processing. Marcelle relies on a reactive programming paradigm to facilitate the definition of such custom pipelines linking together the various tasks of a machine learning workflow. Each component exposes a set of data streams containing the various events produced by the component. These data streams can easily be manipulated (filtered, transformed, combined) and plugged into other components to define pipelines.

By convention, the streams associated with the component are members which names start with a dollar-sign, for instance:

```js
button.$click;
webcam.$images;
webcam.$thumbnails;
mlp.$training;
```

In order to facilitate the conception of custom processing pipelines, components rely on a reactive programming paradigm to generate or react to particular event streams. The reactive programming is well-suited for the development of such event-driven and interactive applications. It facilitates the management of asynchronous data streams, their transformation and the propagation of change to the relevant dependents.
Each component exposes a set of data streams containing the various events produced by the component. These data streams can easily be manipulated (filtered, transformed, combined) and plugged into other components to define pipelines.

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

## Views

```tsx
Component.mount(target?: HTMLElement): void;
```

Components should implement a `mount` method that displays the view assotiated with the component instance. The method takes as optional argument the target HTML element where the view should be mounted. If no target is passed, the component will attempt mounting the component on the DOM element which id is the `id` of the component.

Marcelle does not enforce the use of a particular web framework for programming views, however it uses [Svelte](https://svelte.dev/) internally, for its performance and its native compatibility with reactive data streams.

views can be destroyed using the `destroy` method of the component. Calling `destroy` will not impact the component's processing.
