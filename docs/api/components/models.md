---
sidebarDepth: 3
---

[[toc]]

# Models

## cocoSsd

```tsx
function cocoSsd({ base?: string }): CocoSsd;
```

Object detection model based on tensorflow's [COCO-SSD](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd) implementation. The model localizes and identifies multiple objects in a single image.

### Parameters

| Option | Type   | Description                                                                                                                                                                                                             | Required | Default             |
| ------ | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | ------------------- |
| base   | string | Controls the base cnn model, can be 'mobilenet_v1', 'mobilenet_v2' or 'lite_mobilenet_v2'. lite_mobilenet_v2 is smallest in size, and fastest in inference speed. mobilenet_v2 has the highest classification accuracy. |          | 'lite_mobilenet_v2' |

### Streams

| Name      | Type              | Description                     | Hold |
| --------- | ----------------- | ------------------------------- | :--: |
| \$loading | Stream\<boolean\> | Defines if the model is loading |  ✓   |

### Methods

#### .predict()

```tsx
predict(img: ImageData): Promise<ObjectDetectorResults>
```

Make a prediction from an input image in `ImageData` format. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface ObjectDetectorResults {
  outputs: {
    bbox: [number, number, number, number];
    class: string;
    confidence: number;
  }[];
}
```

### Example

```js
const source = marcelle.imageUpload();
const cocoClassifier = marcelle.cocoSsd();

const cocoPredictionStream = source.$images.map(cocoClassifier.predict).awaitPromises();
```

## kmeansClustering

```tsx
function kmeansClustering({ k?: number }): KMeansClustering;
```

A K-means clustering algorithm based on [ml-kmeans](https://github.com/mljs/kmeans).

### Parameters

| Option | Type   | Description                        | Required | default |
| ------ | ------ | ---------------------------------- | :------: | ------- |
| k      | number | Number of clusters. Defaults to 3. |          | 3       |

The set of reactive parameters has the following signature:

```ts
parameters: {
  k: Stream<number>;
}
```

### Streams

| Name       | Type                     | Description                                                           | Hold |
| ---------- | ------------------------ | --------------------------------------------------------------------- | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events (see above), with no additional data |      |
| \$centers  | Stream\<number[][]\>     | Stream of cluster centers                                             |      |
| \$clusters | Stream\<number[]\>       | Stream of cluster IDs of the training set's instances                 |      |

### Methods

#### .predict()

```tsx
predict(x: number[]): Promise<ClusteringResults>
```

Make a prediction from an input feature array `x`. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface ClusteringResults {
  cluster: number;
  confidences: { [key: number]: number };
}
```

#### .train()

```tsx
train(dataset: Dataset<KMeansInstance> | LazyIterable<KMeansInstance>): Promise<void>
```

Train the model from a given dataset.

### Example

```js
const clustering = marcelle.kmeansClustering({ k: 5 });
clustering.train(trainingSet);
```

## knnClassifier

```tsx
function knnClassifier({ k?: number }): KNNClassifier;
```

A K-Nearest Neighbors classifier based on [Tensorflow.js's implementation](https://github.com/tensorflow/tfjs-models/tree/master/knn-classifier).

### Parameters

| Option | Type   | Description                                                                                                                                                                                                                                                                      | Required | default |
| ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | ------- |
| k      | number | The K value to use in K-nearest neighbors. The algorithm will first find the K nearest examples from those it was previously shown, and then choose the class that appears the most as the final prediction for the input example. Defaults to 3. If examples < k, k = examples. |          | 3       |

The set of reactive parameters has the following signature:

```ts
parameters: {
  k: Stream<number>;
}
```

### Streams

| Name       | Type                     | Description                                                           | Hold |
| ---------- | ------------------------ | --------------------------------------------------------------------- | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events (see above), with no additional data |      |

### Methods

#### .clear()

```tsx
clear(): void
```

Clear the model, removing all instances

#### .predict()

```tsx
predict(x: TensorLike): Promise<ClassifierResults>
```

Make a prediction from an input feature array `x`. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}
```

#### .train()

```tsx
train(
  dataset: Dataset<InputType, OutputType> | ServiceIterable<Instance<InputType, OutputType>>,
): void;
```

Train the model from a given dataset.

### Example

```js
const classifier = marcelle.knnClassifier({ k: 5 });
classifier.train(trainingSet);

const predictionStream = $featureStream // A stream of input features
  .map(classifier.predict)
  .awaitPromises();
```

## mlpClassifier

```tsx
function mlpClassifier({
  layers?: number[],
  epochs?: number,
  batchSize?: number,
}): MLPClassifier;
```

A Multi-Layer Perceptron classifier using Tensorflow.js. The configuration of the model (number of layers and number of hidden nodes per layer) can be configured.

### Parameters

| Option          | Type     | Description                                                                                                              | Required | Default  |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ | :------: | -------- |
| layers          | number[] | The model configuration as an array of numbers, where each element defines a layer with the given number of hidden nodes |          | [64, 32] |
| epochs          | number   | Number of epochs used for training                                                                                       |          | 20       |
| batchSize       | number   | Training data batch size                                                                                                 |          | 8        |
| validationSplit | number   | Proportion of data to use for validation                                                                                 |          | 0.2      |

The set of reactive parameters has the following signature:

```ts
parameters {
  layers: Stream<number[]>;
  epochs: Stream<number>;
  batchSize: Stream<number>;
  validationSplit: number;
}
```

### Streams

| Name       | Type                     | Description                                                                                                                                                                                               | Hold |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events, containing the current status ('idle' / 'start' / 'epoch' / 'success' / 'error'), the current epoch and associated data (such as loss and accuracy) during the training |      |

### Methods

#### .clear()

```tsx
clear(): void
```

Clear the model, removing all instances

#### .predict()

```tsx
predict(x: TensorLike): Promise<ClassifierResults>
```

Make a prediction from an input feature array `x`. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}
```

#### .train()

```tsx
train(
    dataset: Dataset<ClassifierInstance> | LazyIterable<ClassifierInstance>,
    validationDataset?: Dataset<ClassifierInstance> | LazyIterable<ClassifierInstance>,
  ): Promise<void>
```

Train the model from a given dataset, optionally passing a custom validation dataset. If no validation dataset is passed, a train/validation split will be created automatically based on the `validationSplit` parameter.

Instances for TFJS classifiers are as follows:

```ts
interface ClassifierInstance extends Instance {
  x: TensorLike;
  y: string;
}
```

### Example

```js
const classifier = marcelle.mlpClassifier({ layers: [64, 32], epochs: 50 });
classifier.train(trainingSet);

const predictionStream = $featureStream // A stream of input features
  .map(classifier.predict);
  .awaitPromises();
```

## mlpRegressor

```tsx
function mlpRegressor({
  units?: number[],
  epochs?: number,
  batchSize?: number,
}): MLPClassifier;
```

A Multi-Layer Perceptron for regression using Tensorflow.js. The configuration of the model (number of layers and number of hidden nodes per layer) can be configured.

### Parameters

| Option          | Type     | Description                                                                                                              | Required | Default  |
| --------------- | -------- | ------------------------------------------------------------------------------------------------------------------------ | :------: | -------- |
| units           | number[] | The model configuration as an array of numbers, where each element defines a layer with the given number of hidden nodes |          | [64, 32] |
| epochs          | number   | Number of epochs used for training                                                                                       |          | 20       |
| batchSize       | number   | Training data batch size                                                                                                 |          | 8        |
| validationSplit | number   | Proportion of data to use for validation                                                                                 |          | 0.2      |

The set of reactive parameters has the following signature:

```ts
parameters {
  units: Stream<number[]>;
  epochs: Stream<number>;
  batchSize: Stream<number>;
  validationSplit: number;
}
```

### Streams

| Name       | Type                     | Description                                                                                                                                                                                               | Hold |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events, containing the current status ('idle' / 'start' / 'epoch' / 'success' / 'error'), the current epoch and associated data (such as loss and accuracy) during the training |      |

### Methods

#### .clear()

```tsx
clear(): void
```

Clear the model, removing all instances

#### .predict()

```tsx
predict(x: TensorLike): Promise<number | number[]>
```

Make a prediction from an input feature array `x`. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results are either a number or an array of numbers, depending on the training data.

#### .train()

```tsx
train(
  dataset: Dataset<MLPRegressorInstance> | LazyIterable<MLPRegressorInstance>,
  validationDataset?: Dataset<MLPRegressorInstance> | LazyIterable<MLPRegressorInstance>,
): Promise<void>;
```

Train the model from a given dataset, optionally passing a custom validation dataset. If no validation dataset is passed, a train/validation split will be created automatically based on the `validationSplit` parameter.

Instances for the MLPRegressor model are as follows:

```ts
interface MLPRegressorInstance extends Instance {
  x: TensorLike;
  y: number;
}
```

### Example

```js
const regressor = marcelle.mlpRegressor({ units: [64, 32], epochs: 50 });
regressor.train(trainingSet);

const predictionStream = $featureStream // A stream of input features
  .map(regressor.predict);
  .awaitPromises();
```

## mobileNet

```tsx
function mobileNet({
  version?: 1 | 2,
  alpha?: 0.25 | 0.50 | 0.75 | 1.0,
}): MobileNet;
```

The mobileNet component can be used both as a classification model and as a feature extractor. It is based on [Tensorflow.js's Mobilenet implementation](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet). For feature extraction, the `.process()` method can be used to get the embeddings from an input image.

### Parameters

| Option  | Type                        | Description                                                                                                                                                                                                                                                        | Required |
| ------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| version | 1 \| 2                      | The MobileNet version number. Use 1 for [MobileNetV1](https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet_v1.md), and 2 for [MobileNetV2](https://github.com/tensorflow/models/tree/master/research/slim/nets/mobilenet). Defaults to 1. |          |
| alpha   | 0.25 \| 0.50 \| 0.75 \| 1.0 | Controls the width of the network, trading accuracy for performance. A smaller alpha decreases accuracy and increases performance. 0.25 is only available for V1. Defaults to 1.0.                                                                                 |          |

Since parameters are used to load a heavy model, they can only be used on when the component is created, and there are not reactive parameters.

### Methods

#### .predict()

```tsx
predict(image: ImageData): Promise<ClassifierResults>
```

Make a prediction from an input image `image` in ImageData format. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}
```

#### .process()

```tsx
process(image: ImageData): Promise<number[]>
```

Use mobilenet for feature extraction, for example to perform transfer learning. The method returns the embedding for the input image. The size of the embedding depends on the alpha (width) of the model.

### Example

```js
const input = marcelle.webcam();
const m = marcelle.mobileNet();

// Extract features (embedding) from webcam images
const $embedding = input.$images.map((img) => m.process(img)).awaitPromises();

// Predict labels from webcam images (default mobilenet classification)
const $prediction = input.$images.map((img) => m.predict(img)).awaitPromises();
```

## pca

```tsx
function pca(): PCA;
```

Principal Component Analysis (PCA) based on [ml-pca](https://github.com/mljs/pca).

### Streams

| Name       | Type                     | Description                                                                                                                                                                                               | Hold |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events, containing the current status ('idle' / 'start' / 'epoch' / 'success' / 'error'), the current epoch and associated data (such as loss and accuracy) during the training |      |

### Methods

#### .clear()

```tsx
clear(): void
```

Clear the model

#### .predict()

```tsx
predict(x: number[]): Promise<number[]>
```

Project a given data point into the PCA space. The method is asynchronous and returns a promise that resolves with the results of the prediction.

#### .train()

```tsx
train(dataset: Dataset<PCAInstance> | LazyIterable<PCAInstance>): Promise<void>
```

Train the model from a given dataset.

Instances for PCA model are as follows:

```ts
interface PCAInstance extends Instance {
  x: number[];
  y: undefined;
}
```

### Example

```js
const projector = marcelle.pca();
projector.train(trainingSet);

const $projection = $featureStream // A stream of input features
  .map(projector.predict);
  .awaitPromises();
```

## poseDetection

```tsx
function poseDetection(
  model: 'MoveNet' | 'BlazePose' | 'PoseNet' = 'MoveNet',
  modelConfig?: ModelConfig,
): PoseDetection;
```

This component performs pose detection from images using deep learning. It is based on [Tensorflow.js's pose detection implementation](https://github.com/tensorflow/tfjs-models/tree/master/pose-detection/), that includes 3 models: PoseNet, MoveNet and BlazePose. For feature extraction, the `.postprocess()` method can be used to get arrays from the skeleton structure.

### Parameters

| Option  | Type                        | Description                                                                                                                                                                                                                                                        | Required |
| ------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| version | 1 \| 2                      | The MobileNet version number. Use 1 for [MobileNetV1](https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet_v1.md), and 2 for [MobileNetV2](https://github.com/tensorflow/models/tree/master/research/slim/nets/mobilenet). Defaults to 1. |          |
| alpha   | 0.25 \| 0.50 \| 0.75 \| 1.0 | Controls the width of the network, trading accuracy for performance. A smaller alpha decreases accuracy and increases performance. 0.25 is only available for V1. Defaults to 1.0.                                                                                 |          |

Since parameters are used to load a heavy model, they can only be used on when the component is created, and there are not reactive parameters.

### Methods

#### .predict()

```tsx
predict(image: ImageData): Promise<ClassifierResults>
```

Make a prediction from an input image `image` in ImageData format. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}
```

#### .process()

```tsx
process(image: ImageData): Promise<number[]>
```

Use mobilenet for feature extraction, for example to perform transfer learning. The method returns the embedding for the input image. The size of the embedding depends on the alpha (width) of the model.

### Example

```js
const input = marcelle.webcam();
const m = marcelle.mobileNet();

// Extract features (embedding) from webcam images
const $embedding = input.$images.map((img) => m.process(img)).awaitPromises();

// Predict labels from webcam images (default mobilenet classification)
const $prediction = input.$images.map((img) => m.predict(img)).awaitPromises();
```

## tfjsModel

```tsx
function tfjsModel({
  inputType: 'image' | 'generic';
  taskType: 'classification' | 'segmentation' | 'generic';
  segmentationOptions?: {
    output?: 'image' | 'tensor';
    applyArgmax?: boolean;
  };
}): TFJSGenericModel;
```

This component allows to make predictions using pre-trained Tensorflow.js models, in either [LayersModel](https://js.tensorflow.org/api/latest/#class:LayersModel) or [GraphModel](https://js.tensorflow.org/api/latest/#class:GraphModel) format. This component supports:

- Models created with the tf.layers.\*, tf.sequential(), and tf.model() APIs of TensorFlow.js and later saved with the tf.LayersModel.save() method.
- Models converted from Keras or TensorFlow using the tensorflowjs_converter.

It supports several types of input (currently, images or arrays), as well as several types of task (classification, segmentation, generic prediction). Pre-trained models can be loaded either by URL, or through file upload, for instance using the [`fileUpload`](/api/gui-widgets/components.html#fileupload) component.

Such generic models cannot be trained.

::: tip
Note that exporting models from Keras to TFJS can lead to loading errors when particular layers are not implemented in TFJS. In this case, it is possible to export the Keras model to a saved_model and convert it to TFJS, where compatibility should be better.
:::

### Methods

#### .loadFromFiles()

```tsx
loadFromFiles(files: File[]): Promise<void>
```

Load a pre-trained TFJS model from a list files, that should include:

- a `model.json` file defining the model artifacts
- one or several `.bin` weight files

#### .loadFromUrl()

```tsx
loadFromUrl(url: string): Promise<void>
```

Load a pre-trained TFJS model from a URL.

#### .predict()

```tsx
predict(input: InputTypes[InputType]): Promise<PredictionTypes[TaskType]>
```

Make a prediction from an input instance, which type depends on the `inputType` specified in the constructor. The method is asynchronous and returns a promise that resolves with the results of the prediction.

Input types can be:

- `ImageData` if the model was instanciated with `inputType: 'image'`
- `TensorLike` (= array) if the model was instanciated with `inputType: 'generic'`

Output types can be:

- `ClassifierResults` if the model was instanciated with `taskType: 'classification'`
- `ImageData | TensorLike` if the model was instanciated with `taskType: 'segmentation'`
- `TensorLike` if the model was instanciated with `taskType: 'generic'`

Where classifier results have the following interface:

```ts
interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}
```

### Example

```js
const source = imageUpload();
const classifier = tfjsModel({
  inputType: 'image',
  taskType: 'classification',
});
classifier.loadFromUrl();

const predictionStream = source.$images.map(classifier.predict).awaitPromises();
```

## umap

```tsx
function umap({
  nComponents: number,
  nNeighbors: number,
  minDist: number,
  spread: number,
  supervised: boolean,
}): Umap;
```

Uniform Manifold Approximation and Projection (UMAP) is a dimension reduction technique that can be used for visualisation similarly to t-SNE, but also for general non-linear dimension reduction. This component use the [umap-js]( use the umap-js library from the Google PAIR team) library from the Google PAIR team.

### Parameters

| Option      | Type    | Description                                                                                                                       | Required | Default |
| ----------- | ------- | --------------------------------------------------------------------------------------------------------------------------------- | :------: | ------- |
| nComponents | number  | The number of components (dimensions) to project the data to                                                                      |          | 2       |
| nNeighbors  | number  | The number of nearest neighbors to construct the fuzzy manifold                                                                   |          | 15      |
| minDist     | number  | The effective minimum distance between embedded points, used with spread to control the clumped/dispersed nature of the embedding |          | 0.1     |
| spread      | number  | The effective scale of embedded points, used with minDist to control the clumped/dispersed nature of the embedding                |          | 1.0     |
| supervised  | boolean | Whether or not to use labels to perform supervised projection                                                                     |          | false   |

The set of reactive parameters has the following signature:

```ts
parameters: {
  nComponents: Stream<number>;
  nNeighbors: Stream<number>;
  minDist: Stream<number>;
  spread: Stream<number>;
  supervised: Stream<boolean>;
}
```

### Streams

| Name       | Type                     | Description                                                                                                                                                                                | Hold |
| ---------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events, containing the current status ('idle' / 'start' / 'epoch' / 'success' / 'error'), the current epoch and associated data (embeddings) during the training |      |

### Methods

#### .predict()

```tsx
predict(x: number[]): Promise<number[]>
```

Project a given data point into the UMAP space. The method is asynchronous and returns a promise that resolves with the coordinates.

#### .train()

```tsx
train(dataset: Dataset<UmapInstance> | LazyIterable<UmapInstance>): Promise<void>
```

Train the model from a given dataset.

Instances for Umap are as follows:

```ts
interface UmapInstance extends Instance {
  x: number[];
  y: number;
}
```

### Example

```js
const projector = marcelle.umap();
projector.train(trainingSet);
```
