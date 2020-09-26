---
sidebarDepth: 2
---

# Modules

Modules are the building blocks of a Marcelle application and handle various tasks such as capturing images from a webcam, defining a new dataset, instancing a Deep Neural Network (DNN), displaying a confusion matrix, or monitoring the confidence of a model prediction, to name a few. Because Marcelle emphasizes instant feedback and user interaction, modules often provide a graphical user interface that can be displayed on demand in a web application.

The specification of modules is somehow loose in the library, to allow for easy customization and extension. A module os essentially a JavaScript objects exposing a set of reactive streams and providing a `mount` method for displaying their associated view.

All modules have string properties called `name` and `description`. The `name` is used as title for the cards displayed in a dashboard. Each module instance also carries a unique `id`.

### Member Streams

While modules have heterogeneous purposes, their unified interface makes it easy for developers to link together various parts of the processing. Marcelle relies on a reactive programming paradigm to facilitate the definition of such custom pipelines linking together the various tasks of a machine learning workflow. Each module exposes a set of data streams containing the various events produced by the module. These data streams can easily be manipulated (filtered, transformed, combined) and plugged into other modules to define pipelines.
Streams are described in more details in the [next section](/api/streams).

By convention, the streams associated with the module are members which names start with a dollar-sign, for instance:

```js
button.$click;
webcam.$images;
webcam.$thumbnails;
mlp.$training;
```

### Views

```tsx
Module.mount(targetSelector?: string): void;
```

Modules should implement a `mount` method that displays the view assotiated with the module instance. The method takes as argument a CSS selector specifying the target element where the view should be mounted. If no selector is passed, the module will attempt mounting the module on the DOM element which id is the `id` of the module.

Marcelle does not enforce the use of a particular web framework for programming views, however it uses [Svelte](https://svelte.dev/) internally, for its performance and its native compatibility with reactive data streams.

views can be destroyed using the `destroy` method of the module. Calling `destroy` will not impact the module's processing.
