# Marcelle changelog

## Unpublished

- lazy iterables have been added to process service data, in particular dataset data
- The dataset interface has changed (see docs)
- data stores now take a location as argument rather than a configuration object

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
