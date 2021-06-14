---
sidebarDepth: 4
---

# Components

## Charts

### genericChart

```tsx
genericChart({
  preset?: 'line' | 'line-fast' | 'bar' | 'bar-fast';
  options?: ChartOptions;
}): Chart;
```

A Charting component using the [Chart.js](#) library, to visualize data streams.

#### Parameters

| Option  | Type         | Description                                                                     | Required | Default |
| ------- | ------------ | ------------------------------------------------------------------------------- | :------: | :-----: |
| preset  | string       | The chart preset. Available presets are 'line', 'line-fast', 'bar', 'bar-fast'. |          | 'line'  |
| options | ChartOptions | Custom Chart Options                                                            |          |   {}    |

Custom chart options can be passed as an object that is compatible with Chart.js's options ([see online documentation](https://www.chartjs.org/docs/next/)), with 2 additional shorthand options `xlabel` and `ylabel`.

#### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./components/images/chart.png" alt="Screenshot of the chart component">
</div>

#### Example

```js
TODO;
```

### scatterPlot

```tsx
scatterPlot(
  dataset: Stream<number[][]>,
  labels: Stream<string[] | number[]>
  ): ScatterPlot;
```

A scatter plot component using the [scatterGL](https://github.com/PAIR-code/scatter-gl) library.

#### Parameters

| Option  | Type                           | Description                                                                         | Required |
| ------- | ------------------------------ | ----------------------------------------------------------------------------------- | :------: |
| dataset | Stream\<number[][]\>           | Stream of number arrays containing 2-dimensional data to be plotted                 |    ✓     |
| labels  | Stream\<string[] \| number[]\> | Stream of labels (either as strings or numbers) used to apply colors on data points |    ✓     |

<!-- #### Screenshot

```js
TODO;
```

#### Example

```js
TODO;
``` -->

## Data sources

### fileUpload

```tsx
marcelle.fileUpload(): fileUpload;
```

A file upload component, that creates a stream of files.

#### Streams

| Name    | Type              | Description     | Hold |
| ------- | ----------------- | --------------- | :--: |
| \$files | Stream\<never()\> | Stream of files |

#### Example

```js
const myFileUpload = marcelle.fileUpload();
myFileUpload.$files.subscribe((x) => console.log('fileUpload $files:', x));
```

### imageUpload

```tsx
marcelle.imageUpload({ width?: number, height?: number }): ImageUpload;
```

An Image upload component, that creates a stream of images and thumbnails. Images are cropped and rescaled to match the target dimensions, if these are non-zero, otherwise the dimensions are unchanged.

#### Parameters

| Option | Type   | Description         | Required | Default |
| ------ | ------ | ------------------- | :------: | :-----: |
| width  | number | Target image width  |          |    0    |
| height | number | Target image height |          |    0    |

#### Streams

| Name         | Type                | Description                                                                                                                        | Hold |
| ------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$images     | Stream\<ImageData\> | Stream of images in the [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) format.                            |
| \$thumbnails | Stream\<string\>    | Stream of thumbnail images in base64 [dataURI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) format. |      |

#### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/imageUpload.png" alt="Screenshot of the imageUpload component" width="350">
</div>

#### Example

```js
const imgUpload = marcelle.imageUpload();
imgUpload.$images.subscribe((x) => console.log('imageUpload $images:', x));
```

### sketchPad

```tsx
marcelle.sketchpad(): Sketchpad;
```

An input sketching component allowing the user to draw. The module generates a stream of images of the sketches, as well as stream for various user actions.

#### Streams

| Name          | Type                | Description                                                                                                                        | Hold |
| ------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$images      | Stream\<ImageData\> | Stream of images in the [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) format.                            |
| \$thumbnails  | Stream\<string\>    | Stream of thumbnail images in base64 [dataURI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) format. |      |
| \$strokeStart | Stream\<undefined\> | Stream of empty (undefined) events occurring every time the user starts drawing                                                    |      |
| \$strokeEnd   | Stream\<undefined\> | Stream of empty (undefined) events occurring every time the user stops drawing                                                     |      |

#### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/sketchpad.png" alt="Screenshot of the sketchpad component" width="350">
</div>

#### Example

```js
const sketch = marcelle.sketchpad();
sketch.$strokeStart.subscribe(() => console.log('sketchpad $strokeStart'));
sketch.$strokeEnd.subscribe(() => console.log('sketchpad $strokeEnd'));
```

### webcam

```tsx
marcelle.webcam({ width?: number, height?: number, period?: number }): Webcam;
```

A webcam source component, producing a periodic stream of images.

#### Parameters

| Option | Type   | Description                                  | Required | Default |
| ------ | ------ | -------------------------------------------- | :------: | :-----: |
| width  | number | The target image width                       |          |   224   |
| height | number | The target image height                      |          |   224   |
| period | number | The period in ms at which images are sampled |          |   50    |

#### Streams

| Name          | Type                  | Description                                                                                                                        | Hold |
| ------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$images      | Stream\<ImageData\>   | Stream of images in the [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) format.                            |
| \$thumbnails  | Stream\<string\>      | Stream of thumbnail images in base64 [dataURI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) format. |      |
| \$active      | Stream\<boolean\>     | Boolean stream specifying if the webcam is active (streaming)                                                                      |      |
| \$ready       | Stream\<boolean\>     | Boolean stream specifying if the webcam is ready                                                                                   |      |
| \$mediastream | Stream\<MediaStream\> | Stream of MediaStream corresponding to the selected webcam. Events are emitted whenever a webcam is selected.                      |      |

#### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/webcam.png" alt="Screenshot of the webcam component" width="350">
</div>

#### Example

```js
const webcam = marcelle.webcam();
webcam.$images.subscribe((x) => console.log('webcam $images:', x));
```

## Data displays

### datasetBrowser

```tsx
marcelle.datasetBrowser(dataset: Dataset<InputType, string>): DatasetBrowser;
```

A Dataset browser provides an interface to visualize the contents of a dataset. It takes a dataset as argument, assuming that each instance contains a `thumbnail` property that can be displayed as an image (typically, a base64 dataURI).

#### Parameters

| Option  | Type    | Description              | Required |
| ------- | ------- | ------------------------ | :------: |
| dataset | Dataset | The dataset to visualize |    ✓     |

#### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/dataset-browser.png" alt="Screenshot of the datasetBrowser component">
</div>

#### Example

```js
const trainingSetBrowser = marcelle.datasetBrowser(trainingSet);
dashboard.page('Data Management').use(trainingSetBrowser);
```

### imageDisplay

```tsx
marcelle.imageDisplay(imageStream: Stream<ImageData> | Stream<ImageData[]>): DatasetBrowser;
```

An Image Display allows for displaying an image on screen provided by an input stream.

#### Parameters

| Option      | Type                                         | Description                                                                                        | Required |
| ----------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------- | :------: |
| imageStream | Stream\<ImageData\> \| Stream\<ImageData[]\> | Stream of images of [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) format |    ✓     |

<!-- #### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/dataset-browser.png" alt="Screenshot of the datasetBrowser component">
</div> -->

#### Example

```js
const source = imageUpload({ width: 224, height: 224 });
const instanceViewer = marcelle.imageDisplay(source.$images);
dashboard.page('Data').use(instanceViewer);
```

## Datasets

### Dataset

```tsx
marcelle.dataset(name: string, store: DataStore): Dataset;
```

A Dataset module allowing for capturing instances from a stream, storing them in a local or remote [data-store](/api/data-stores.html).

#### Parameters

| Option | Type      | Description                                                                   | Required |
| ------ | --------- | ----------------------------------------------------------------------------- | :------: |
| name   | string    | The dataset name                                                              |    ✓     |
| store  | DataStore | The [dataStore](/api/data-stores) used to store the instances of the dataset. |    ✓     |

#### Streams

| Name      | Type                      | Description                                                                                                                                                                                              | Hold |
| --------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$count   | Stream\<number\>          | Total number of instances in the dataset                                                                                                                                                                 |      |
| \$changes | Stream\<DatasetChange[]\> | Stream of changes applied to the dataset. Changes can concern a number of modifications (creation, update, deletion, ...) at various levels (dataset, class, instance). The interface is described below |      |

Where dataset changes have the following interface:

```ts
interface DatasetChange {
  level: 'instance' | 'dataset';
  type: 'created' | 'updated' | 'removed' | 'renamed';
  data?: unknown;
}
```

#### Methods

<!-- ##### .capture()

```tsx
capture(instanceStream: Stream<Instance>): void
```

Capture instances to a dataset from a reactive stream. Each event on the stream should respect the `Instance` interface:

```ts
interface Instance {
  label: string;
  data: unknown;
  thumbnail?: string;
  features?: number[][];
  type?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
``` -->

##### .clear()

```tsx
async clear(): Promise<void>
```

Clear the dataset, removing all instances.

##### .create()

```tsx
async create(instance: Instance<InputType, OutputType>, params?: FeathersParams): Promise<Instance<InputType, OutputType>>
```

Create an instance in the dataset

| Option   | Type                              | Description                                                                                              | Required |
| -------- | --------------------------------- | -------------------------------------------------------------------------------------------------------- | :------: |
| instance | Instance\<InputType, OutputType\> | The instance data                                                                                        |    ✓     |
| params   | FeathersParams                    | Feathers Query parameters. See [Feathers docs](https://docs.feathersjs.com/api/databases/querying.html). |          |

##### .download()

```tsx
async download(): Promise<void>
```

Download the dataset as a unique json file.

##### .get()

```tsx
async get(id: ObjectId, params?: FeathersParams): Promise<Instance<InputType, OutputType>>
```

Get an instance from the dataset by ID, optionally passing Feathers parameters.

| Option | Type           | Description                                                                                              | Required |
| ------ | -------------- | -------------------------------------------------------------------------------------------------------- | :------: |
| id     | ObjectId       | The instance's unique ID                                                                                 |    ✓     |
| params | FeathersParams | Feathers Query parameters. See [Feathers docs](https://docs.feathersjs.com/api/databases/querying.html). |          |

##### .items()

```tsx
items(): ServiceIterable<Instance<InputType, OutputType>>
```

Get a lazy service iterable to iterate over the dataset.

::: warning TODO
Document lazy iterables and service iterables in data stores?
:::

Example:

```ts
const instances = await dataset
  .items() // get iterable
  .query({ label: 'A' }) // query instances with label 'A'
  .select(['id', 'thumbnail']) // select the fields to return
  .toArray(); // convert to array
```

##### .patch()

```tsx
patch(id: ObjectId, changes: Partial<Instance>, params?: FeathersParams): Promise<Instance>
```

Patch an instance in the dataset

| Option  | Type                | Description                                                                                              | Required |
| ------- | ------------------- | -------------------------------------------------------------------------------------------------------- | :------: |
| id      | ObjectId            | The instance's unique ID                                                                                 |    ✓     |
| changes | Partial\<Instance\> | The instance data                                                                                        |    ✓     |
| params  | FeathersParams      | Feathers Query parameters. See [Feathers docs](https://docs.feathersjs.com/api/databases/querying.html). |          |

##### .remove()

```tsx
remove(id: ObjectId, params?: FeathersParams): Promise<Instance>
```

Remove an instance from the dataset

| Option | Type           | Description                                                                                              | Required |
| ------ | -------------- | -------------------------------------------------------------------------------------------------------- | :------: |
| id     | ObjectId       | The instance's unique ID                                                                                 |    ✓     |
| params | FeathersParams | Feathers Query parameters. See [Feathers docs](https://docs.feathersjs.com/api/databases/querying.html). |          |

##### .update()

```tsx
update(id: ObjectId, instance: Instance<InputType, OutputType>, params?: FeathersParams): Promise<Instance>
```

Update an instance in the dataset

| Option   | Type                              | Description                                                                                              | Required |
| -------- | --------------------------------- | -------------------------------------------------------------------------------------------------------- | :------: |
| id       | ObjectId                          | The instance's unique ID                                                                                 |    ✓     |
| instance | Instance\<InputType, OutputType\> | The instance data                                                                                        |    ✓     |
| params   | FeathersParams                    | Feathers Query parameters. See [Feathers docs](https://docs.feathersjs.com/api/databases/querying.html). |          |

##### .upload()

```tsx
async upload(files: File[]): Promise<void>
```

Upload a dataset from files.

| Option | Type   | Description                 | Required |
| ------ | ------ | --------------------------- | :------: |
| files  | File[] | Array of files of type File |    ✓     |

#### Example

```js
const store = marcelle.dataStore('localStorage');
const trainingSet = marcelle.dataset('TrainingSet', store);
trainingSet.capture($instances); // Capture a Stream of instances
```

## Model interface

### modelParameters

### trainingProgress

### trainingPlot

## Models

## Prediction displays

### confidencePlot

### detectionBoxes

### confusionMatrix

## Widgets

### button

### slider

### toggle

### textInput

### text

### select
