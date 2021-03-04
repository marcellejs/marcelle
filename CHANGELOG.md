# Marcelle changelog

## Unreleased

### Breaking changes

- `tfImageClassifier` has been replaced by `tfGenericModel`
- Module `name` property has been replaced by `title`
- Modules' mount method now accepts an HTML Element rather than a selector
- `imageDrop` has been renamed to `imageUpload`
- `browser` has been renamed to `datasetBrowser`
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
