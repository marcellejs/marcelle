---
sidebarDepth: 1
---

# Models

Models are standard Marcelle modules with two additional characteristics. First, they have a property called `parameters`, which is a record of parameter values as streams. This structure is useful to provide interfaces that dynamically change the values of the model parameters. Second, they carry a set of methods for training and prediction. Some methods are standardized, such as `.train(dataset)` and `.predict(features)`, however models can expose additional specific methods.

Models implement the following interface:

```ts
interface Model {
  parameters: {
    [name: string]: Stream<any>;
  };
  $training: Stream<TrainingStatus>;
  train(dataset: Dataset): void;
  predict(x: InputType): Promise<ResultType>;
}
```

Models expose a `$training` stream that monitors the training process. Each `TrainingStatus` event has the following interface:

```ts
interface TrainingStatus {
  status: 'idle' | 'start' | 'epoch' | 'success' | 'error' | 'loaded';
  epoch?: number;
  epochs?: number;
  data?: Record<string, unknown>;
}
```

Where the `data` field varies across models to include additional information, such as the training and validation loss/accuracy in the case of neural networks.

::: warning TODO
Detail the standardized `classifier` base class and the associated results interfaces
:::

## CocoSSD

```tsx
cocoSsd({ base?: string }): CocoSsd;
```

<!-- 'mobilenet_v1' | 'mobilenet_v2' | 'lite_mobilenet_v2' -->

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
async predict(img: ImageData): Promise<ObjectDetectorResults>
```

Make a prediction from an input image in ImageData format. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

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

const cocoPredictionStream = source.$images
  .map(async (img) => cocoClassifier.predict(img))
  .awaitPromises();
```

## KNN

```tsx
marcelle.knn({ k?: number, dataStore: DataStore }): KNN;
```

A K-Nearest Neighbors classifier based on [Tensorflow.js's implementation](https://github.com/tensorflow/tfjs-models/tree/master/knn-classifier).

### Parameters

| Option    | Type      | Description                                                                                                                                                                                                                                                                      | Required | default |
| --------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | ------- |
| k         | number    | The K value to use in K-nearest neighbors. The algorithm will first find the K nearest examples from those it was previously shown, and then choose the class that appears the most as the final prediction for the input example. Defaults to 3. If examples < k, k = examples. |          | 3       |
| dataStore | DataStore | The [dataStore](/api/data-stores) used to store the model. This parameter is optional. By default, a data store in memory will be created.                                                                                                                                       |          |

The set of reactive parameters has the following signature:

```ts
interface KNNParameters {
  k: Stream<number>;
}
```

### Streams

| Name       | Type                     | Description                                                           | Hold |
| ---------- | ------------------------ | --------------------------------------------------------------------- | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events (see above), with no additional data |      |

### Methods

#### .train()

```tsx
train(dataset: Dataset): void
```

Train the model from a given dataset.

#### .clear()

```tsx
clear(): void
```

Clear the model, removing all instances

#### .predict()

```tsx
async predict(x: number[][]): Promise<KNNResults>
```

Make a prediction from an input feature array `x`. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface KNNResults {
  label: string;
  confidences: { [key: string]: number };
}
```

### Example

```js
const classifier = marcelle.knn({ k: 5 });
classifier.train(trainingSet);

const predictionStream = $featureStream // A stream of input features
  .map(async (features) => classifier.predict(features))
  .awaitPromises();
```

## MLP

```tsx
marcelle.mlp({
  layers?: number[],
  epochs?: number,
  batchSize?: number,
  dataStore?: DataStore
  }): MLP;
```

A Multi-Layer Perceptron using Tensorflow.js. The configuration of the model (number of layers and number of hidden nodes per layer) can be configured.

### Parameters

| Option    | Type      | Description                                                                                                                                | Required | Default  |
| --------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------ | :------: | -------- |
| layers    | number[]  | The model configuration as an array of numbers, where each element defines a layer with the given number of hidden nodes                   |          | [64, 32] |
| epochs    | number    | Number of epochs used for training                                                                                                         |          | 20       |
| batchSize | number    | Training data batch size                                                                                                                   |          | 8        |
| dataStore | DataStore | The [dataStore](/api/data-stores) used to store the model. This parameter is optional. By default, a data store in memory will be created. |          |

The set of reactive parameters has the following signature:

```ts
interface MLPParameters {
  layers: Stream<number[]>;
  epochs: Stream<number>;
  batchSize: Stream<number>;
}
```

### Streams

| Name       | Type                     | Description                                                                                                                                                                                               | Hold |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events, containing the current status ('idle' / 'start' / 'epoch' / 'success' / 'error'), the current epoch and associated data (such as loss and accuracy) during the training |      |

### Methods

#### .train()

```tsx
train(dataset: Dataset): void
```

Train the model from a given dataset.

#### .clear()

```tsx
clear(): void
```

Clear the model, removing all instances

#### .predict()

```tsx
async predict(x: number[][]): Promise<MLPResults>
```

Make a prediction from an input feature array `x`. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface MLPResults {
  label: string;
  confidences: { [key: string]: number };
}
```

### Example

```js
const classifier = marcelle.mlp({ layers: [64, 32], epochs: 50 });
classifier.train(trainingSet);

const predictionStream = $featureStream // A stream of input features
  .map(async (features) => classifier.predict(features));
  .awaitPromises();
```

## Mobilenet

```tsx
marcelle.mobilenet({
  version?: 1 | 2,
  alpha?: 0.25 | 0.50 | 0.75 | 1.0,
}): Mobilenet;
```

The mobilenet module can be used both as a classification model and as a feature extractor. It is based on [Tensorflow.js's Mobilenet implementation](https://github.com/tensorflow/tfjs-models/tree/master/mobilenet). For feature extraction, the `.process()` method can be used to get the embeddings from an input image.

### Parameters

| Option  | Type                        | Description                                                                                                                                                                                                                                                        | Required |
| ------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| version | 1 \| 2                      | The MobileNet version number. Use 1 for [MobileNetV1](https://github.com/tensorflow/models/blob/master/research/slim/nets/mobilenet_v1.md), and 2 for [MobileNetV2](https://github.com/tensorflow/models/tree/master/research/slim/nets/mobilenet). Defaults to 1. |          |
| alpha   | 0.25 \| 0.50 \| 0.75 \| 1.0 | Controls the width of the network, trading accuracy for performance. A smaller alpha decreases accuracy and increases performance. 0.25 is only available for V1. Defaults to 1.0.                                                                                 |          |

Since parameters are used to load a heavy model, they can only be used on when the module is created, and there are not reactive parameters.

### Methods

#### .process()

```tsx
async process(image: ImageData): Promise<number[][]>
```

Use mobilenet for feature extraction, for example to perform transfer learning. The method returns the embedding for the input image. The size of the embedding depends on the alpha (width) of the model.

#### .predict()

```tsx
async predict(image: ImageData): Promise<MobilenetResults>
```

Make a prediction from an input image `image` in ImageData format. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface MobilenetResults {
  label: string;
  confidences: { [key: string]: number };
}
```

### Example

```js
const input = marcelle.webcam();
const m = marcelle.mobilenet();

// Extract features (embedding) from webcam images
const $embedding = input.$images.map((img) => m.process(img)).awaitPromises();

// Predict labels from webcam images (default mobilenet classification)
const $prediction = input.$images.map((img) => m.predict(img)).awaitPromises();
```

## TfImageClassifier

```tsx
tfImageClassifier(): TfImageClassifier;
```

This module provides a generic image classifier using pre-trained Tensorflow.js models. It provides a view allowing users to upload a pretrained model in the [LayersModel](https://js.tensorflow.org/api/latest/#loadLayersModel) format.

### Methods

#### .predict()

```tsx
async predict(img: ImageData): Promise<ClassifierResults>
```

Make a prediction from an input image in ImageData format. The method is asynchronous and returns a promise that resolves with the results of the prediction. The results have the following signature:

```ts
interface ClassifierResults {
  label: string;
  confidences: { [key: string]: number };
}
```

### Example

```js
const source = marcelle.imageUpload();
const classifier = marcelle.tfImageClassifier();

const predictionStream = source.$images.map(async (img) => classifier.predict(img)).awaitPromises();
```
