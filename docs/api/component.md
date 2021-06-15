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
Streams are described in more details in the [next section](/api/streams.html).

By convention, the streams associated with the component are members which names start with a dollar-sign, for instance:

```js
button.$click;
webcam.$images;
webcam.$thumbnails;
mlp.$training;
```

## Views

```tsx
Module.mount(target?: HTMLElement): void;
```

Components should implement a `mount` method that displays the view assotiated with the component instance. The method takes as optional argument the target HTML element where the view should be mounted. If no target is passed, the component will attempt mounting the component on the DOM element which id is the `id` of the component.

Marcelle does not enforce the use of a particular web framework for programming views, however it uses [Svelte](https://svelte.dev/) internally, for its performance and its native compatibility with reactive data streams.

views can be destroyed using the `destroy` method of the component. Calling `destroy` will not impact the component's processing.
