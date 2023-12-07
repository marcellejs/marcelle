# Marcelle changelog

## 0.6.3

### Patch Changes

- 6073dab: New components: mediaRecorder and videoPlayer
- c9a770e: Add a method for asset uploading on the dataStore interface
- c9a770e: Fixed websocket connection issues with data stores

## 0.6.2

### Patch Changes

- 8c5bd35: Fixed errors with Tensorflow.js backend selection

## 0.6.1

### Patch Changes

- e0d0264: Improve mobile support in the webcam component and button widget
- fb9ef1f: an audio option was added to the webcam component

## 0.6.0

### Minor Changes

- 259aec6: Authentication and authorization have been improved. @marcelle/backend now uses feathers-casl for authorization. Login management has also been improved, although documentation remains scarce.
- 259aec6: Models have been refactored to facilitate the creation of custom TFJS models. The new architecture involves the following classes:

  ```bash
  Model<T extends Instance, PredictionType>
  ├── TFJSBaseModel<T extends Instance, PredictionType>
  │   └── TFJSCustomModel<T extends Instance, PredictionType>
  │   └── TFJSCustomClassifier
  ```

- ee3dc04: To avoid errors with svelte>3.39, the `ViewContainer` component was moved to `@marcellejs/design-system`:

  ```js
  import { ViewContainer } from '@marcellejs/design-system';
  ```

- efb72b2: Data stores are no longer passed to the constructor of machine learning models for model synchronization. Instead, a data store must be passed explicitly to `.sync()`, `.save()` and `.load()`.
- 0325b8f: The `DatasetBrowser` component was improved so that only a few instances per class are loaded by default, and a button is available to view more.
  The number of images per batch can be specified with the new `batchSize` option.

  The previous behavior is available by using:

  ```js
  datasetBrowser(trainingSet, { batchSize: 0 });
  ```

- df75185: The batch prediction component has been improved, along with the confusion matrix. There are breaking changes in their API.
- 45e0200: A generic progress bar was introduced to refactor training-progress

### Patch Changes

- 259aec6: `genericChart` now supports dates for time series plotting
- 514360e: New components:

  - `textArea` widget
  - `poseDetection` model for continuous pose estimation with Deep Learning, using Tensorflow.js

- 06a4a7a: A new method `.get()` was added to streams, in order to avoid accessing `.value` directly, which was found confusing for beginners.
  To update your code, replace `$<stream>.value` by `$<stream>.get()`, for example:

  ```js
  input.$images
    .filter(() => capture.$pressed.get()) // instead of capture.$pressed.value
    .map(async (img) => ({
      x: await featureExtractor.process(img),
      thumbnail: input.$thumbnails.get(), // instead of input.$thumbnails.value
      y: label.$value.get(), // instead of label.$value.value
    }));
  ```

- 45e0200: Datasets now include à `.sift()` method to filter their contents with a Feathers query. Sifting a dataset adds a filter on its data that affects all interactions with the dataset and its dependent.
- de0357c: Fixed bundling bug due to rollup plugin update
- 98fb655: Base UI components were moved to a separate package called `@marcellejs/design-system`
- 259aec6: Services now have a method called `items()` to get a lazy iterable over service items
- a9815cc: New component: `datasetScatter`
- cde09ae: New component: `umap` model
- 259aec6: Models' `train` method now accepts a validation dataset as second argument
- ae31375: New component: `pca` model
- 20934cd: New component: `mlpRegressor` model
- ad66e7d: Component methods are now automatically bound by default. It is not necessary to bind methods, for example to record instances: `$instances.subscribe(trainingSet.create);`

## 0.6.0-next.2

### Patch Changes

- a9815cc: New component: `datasetScatter`
- cde09ae: New component: `umap` model
- ae31375: New component: `pca` model
- 20934cd: New component: `mlpRegressor` model

## 0.6.0-next.1

### Patch Changes

- de0357c: Fixed bundling bug due to rollup plugin update

## 0.6.0-next.0

### Minor Changes

- 259aec6: Authentication and authorization have been improved. @marcelle/backend now uses feathers-casl for authorization. Login management has also been improved, although documentation remains scarce.
- 259aec6: Models have been refactored to facilitate the creation of custom TFJS models. The new architecture involves the following classes:

  ```bash
  Model<T extends Instance, PredictionType>
  ├── TFJSBaseModel<T extends Instance, PredictionType>
  │   └── TFJSCustomModel<T extends Instance, PredictionType>
  │   └── TFJSCustomClassifier
  ```

- ee3dc04: To avoid errors with svelte>3.39, the `ViewContainer` component was moved to `@marcellejs/design-system`:

  ```js
  import { ViewContainer } from '@marcellejs/design-system';
  ```

- efb72b2: Data stores are no longer passed to the constructor of machine learning models for model synchronization. Instead, a data store must be passed explicitly to `.sync()`, `.save()` and `.load()`.
- 0325b8f: The `DatasetBrowser` component was improved so that only a few instances per class are loaded by default, and a button is available to view more.
  The number of images per batch can be specified with the new `batchSize` option.

  The previous behavior is available by using:

  ```js
  datasetBrowser(trainingSet, { batchSize: 0 });
  ```

- df75185: The batch prediction component has been improved, along with the confusion matrix. There are breaking changes in their API.
- 45e0200: A generic progress bar was introduced to refactor training-progress

### Patch Changes

- 259aec6: `genericChart` now supports dates for time series plotting
- 514360e: New components:

  - `textArea` widget
  - `poseDetection` model for continuous pose estimation with Deep Learning, using Tensorflow.js

- 06a4a7a: A new method `.get()` was added to streams, in order to avoid accessing `.value` directly, which was found confusing for beginners.
  To update your code, replace `$<stream>.value` by `$<stream>.get()`, for example:

  ```js
  input.$images
    .filter(() => capture.$pressed.get()) // instead of capture.$pressed.value
    .map(async (img) => ({
      x: await featureExtractor.process(img),
      thumbnail: input.$thumbnails.get(), // instead of input.$thumbnails.value
      y: label.$value.get(), // instead of label.$value.value
    }));
  ```

- 45e0200: Datasets now include à `.sift()` method to filter their contents with a Feathers query. Sifting a dataset adds a filter on its data that affects all interactions with the dataset and its dependent.
- 98fb655: Base UI components were moved to a separate package called `@marcellejs/design-system`
- 259aec6: Services now have a method called `items()` to get a lazy iterable over service items
- 259aec6: Models' `train` method now accepts a validation dataset as second argument
- ad66e7d: Component methods are now automatically bound by default. It is not necessary to bind methods, for example to record instances: `$instances.subscribe(trainingSet.create);`

## v0.5.1

- `confusionMatrix` had a few improvements (debounced to avoid UI hangs, axis titles, tooltip, `$selected` stream)
- Dataset's `distinct` method was fixed for client-side storage
- [dev] dependencies and config were upgraded
- [dev] Storybook was removed

## v0.5.0

- `modelParameters` was improved to support other types
- `genericChart` was improved to support lazy iterators (e.g. for datasets)
- New component `onnxModel` using onnruntime-web with a wasm backend by default
- New widgets (components): `number` and `numberArray`
- `textField` was updated to `textInput` and its API was updated (`$value` stream instead of `$text`)
- `button`, `text`, `toggle`, `select`: minor API changes (simplified constructors)
- `slider` was improved with better defaults for pips and a continuous mode

## v0.4.4

- Various minor bugfixes

## v0.4.3

- Fixed svelte component compilation (reverted to svelte v3.39)
- Fixed KNN Classifier

## v0.4.2

- New `trainingHistory` component to track and monitor training runs.
- `datasetTable` now automatically extracts columns from service data
- Removed `onnxModel` from release due to limited operator support.
- Improved documentation website

## v0.4.1

- new component: `datasetTable` to display the contents of a dataset as a table
- new example : `iris` classification from CSV data
- Fixed: dataset count was not updated on instance deletion

## v0.4.0

### Breaking Changes ⚠️

- The dataset interface has changed significantly. Refer to the documentation for upgrading:
- The interface for models' `.train()` method has changed. `train` now accepts either a Dataset or an iterable for training, where instances are objects with `x` and `y` properties for input and output, respectively.
- `BatchPrediction.predict()` now accepts datasets or iterables.
- data stores now take a location as argument rather than a configuration object

Many components and methods have been renamed for consistency. Any application built with a previous version of Marcelle is expected to break. The online documentation is up to date with the current naming. The list of name changes is as follows:

| Previous name           | New Name                |
| ----------------------- | ----------------------- |
| Module                  | Component               |
| ModuleBase              | ViewContainer           |
| Dashboard.start()       | Dashboard.show()        |
| Dashboard.destroy()     | Dashboard.hide()        |
| DashboardPage.useLeft() | DashboardPage.sidebar() |
| Wizard.start()          | Wizard.show()           |
| Wizard.destroy()        | Wizard.hide()           |
| Wizard.step()           | Wizard.page()           |
| Button.$down            | Button.$pressed         |
| textfield               | textField               |
| chart                   | genericChart            |
| sketchpad               | sketchPad               |
| mlp                     | mlpClassifier           |
| knn                     | knnClassifier           |
| onnx                    | onnxModel               |
| tfGenericModel          | tfjsModel               |
| mobilenet               | mobileNet               |
| parameters              | modelParameters         |
| classificationPlot      | confidencePlot          |
| visObjectDetection      | detectionBoxes          |

### New Features

- Lazy iterables have been added to process service data, in particular dataset data (TODO: add link to documentation)
- Services now support a `$distinct` query parameter to get the list of distinct values for a particular field.
- K-Means clustering
- Styling no longer pollutes global CSS. Tailwind's Preflight was removed so that Marcelle does not interact with top-level styles when integrated in another application.

### Internal Changes

- The core UI components have been updated
- Storybook has been added to support the development of core UI components
- The performance of KNN and DatasetBrowser has been improved
- [style] ESLint configuration has been improved
- [style] For-of loops are used instead of forEach

## v0.3.2

- Typings have been fixed

## v0.3.1

- Fix concurrent state updates in datasets
- Set webcam to face the environment by default on mobile devices

## v0.3.0

### Breaking changes

- bundled build now includes tfjs
- The `StoredModel` interface has been updated following the addition of GridFs support for model upload on remote servers.

### New Features

- New module: `imageDisplay` for displaying image streams
- Datasets and models now support real-time synchronization across clients when using a server-side backend
- dashboard pages now take an optional `showSidebar` argument (true by default)

### Misc

- Update tensorflow.js to version 3
- KNN now avoids throwing in the predict method
- dataset's clear method has been fixed
- Various bug fixes

## v0.2.0

### Breaking changes

- `tfImageClassifier` has been replaced by `tfGenericModel`
- Module `name` property has been replaced by `title`
- Modules' mount method now accepts an HTML Element rather than a selector
- `imageDrop` has been renamed to `imageUpload`
- `browser` has been renamed to `datasetBrowser`
- `progress` has been renamed to `trainingProgress`
- `confusion` has been renamed to `confusionMatrix`
- Dashboards now have a `closable` option, which is disabled by default.
- Dataset's `$created` stream has been replaced by a more generic `$changes` stream

### New Features

- Mobilenet and COCO-SSD are now cached in the browser's storage for improved network performance
- Model Storage: models can be saved and loaded from datastores. They can be automatically synchronized with a datastore. File import/export is also possible
- Dataset upload has been added
- Dashboard now expose $active and $page streams to monitor its state
- Dashboard settings have been improved (TODO: give details + breaking changes)
- `trainingPlot`: The logs to display can be be configured in the module's options. It is possible to pass either a scalar (incremental mode) an array for each log.
- `imageUpload` now supports target image dimensions and automatically crops and resizes images
- `datasetBrowser` now allows the selection, deletion or class change of instances

### New Modules

- `tfGenericModel`
- `fileUpload`
- `imageUpload`
- `onnxImageClassifier`

### Deprecated Modules

- `tfImageClassifier`
- `imageDrop`

### Performance Improvements

- Datasets have been updated for improved performance
- Memory management related to TFJS has been improved

### Bug Fixes

- `webcam` now supports multiple video devices
- Quite a few others...

### Internal Changes

- Build system update
- Examples now use vite
- Svelte components now use Typescript
- Module's `description` was unused and has been removed
- Data stores have a `$services` stream and have been simplified
- The architecture for models has been improved

## v0.1.0-alpha.4

- First-ish published version
