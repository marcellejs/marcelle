# Marcelle changelog

## Next

- Improved `modelParameters` to support other types

## 0.4.4

- Various minor bugfixes

## 0.4.3

- Fixed svelte component compilation (reverted to svelte v3.39)
- Fixed KNN Classifier

## 0.4.2

- New `trainingHistory` component to track and monitor training runs.
- `datasetTable` now automatically extracts columns from service data
- Removed `onnxModel` from release due to limited operator support.
- Improved documentation website

## 0.4.1

- new component: `datasetTable` to display the contents of a dataset as a table
- new example : `iris` classification from CSV data
- Fixed: dataset count was not updated on instance deletion

## 0.4.0

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

## 0.1.0-alpha.4

- First-ish published version
