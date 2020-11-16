---
sidebarDepth: 1
---

# Models

Models are standard Marcelle modules with two additional characteristics. First, they have a property called `parameters`, which is a record of parameter values as streams. This structure is useful to provide interfaces that dynamically change the values of the model parameters. Second, they carry a set of methods for training and prediction. Some methods are standardized, such as `.train(dataset)` and `.predict(features)`, however models can expose additional specific methods.

Models implement the following interface for reactive parameters:

```ts
interface Parametrable {
  parameters: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: Stream<any>;
  };
}
```

## CocoSSD

::: warning
TODO
:::

## KNN

```tsx
marcelle.knn({ k: number }): KNN;
```

A K-Nearest Neighbors classifier based on [Tensorflow.js's implementation](https://github.com/tensorflow/tfjs-models/tree/master/knn-classifier).

### Parameters

| Option | Type   | Description                                                                                                                                                                                                                                                                      | Required |
| ------ | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| k      | number | The K value to use in K-nearest neighbors. The algorithm will first find the K nearest examples from those it was previously shown, and then choose the class that appears the most as the final prediction for the input example. Defaults to 3. If examples < k, k = examples. |          |

The set of reactive parameters has the following signature:

```ts
interface KNNParameters {
  k: Stream<number>;
}
```

### Streams

| Name       | Type                     | Description                                                                                                                                                                                               | Hold |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events, containing the current status ('idle' / 'start' / 'epoch' / 'success' / 'error'), the current epoch and associated data (such as loss and accuracy) during the training |      |

Each `$training` event has the following signature:

```ts
interface TrainingStatus {
  status: 'idle' | 'start' | 'epoch' | 'success' | 'error';
  epoch?: number;
  epochs?: number;
  data?: Record<string, unknown>;
}
```

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
const $embedding = input.$images.map((img) => m.predict(img)).awaitPromises();
```

## MLP

```tsx
marcelle.mlp({ layers: number[], epochs: number }): MLP;
```

A Multi-Layer Perceptron using Tensorflow.js. The configuration of the model (number of layers and number of hidden nodes per layer) can be configured.

### Parameters

| Option | Type     | Description                                                                                                              | Required |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------ | :------: |
| layers | number[] | The model configuration as an array of numbers, where each element defines a layer with the given number of hidden nodes |          |
| epochs | number   | Number of epochs used for training                                                                                       |          |

The set of reactive parameters has the following signature:

```ts
interface MLPParameters {
  layers: Stream<number[]>;
  epochs: Stream<number>;
}
```

### Streams

| Name       | Type                     | Description                                                                                                                                                                                               | Hold |
| ---------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$training | Stream\<TrainingStatus\> | Stream of training status events, containing the current status ('idle' / 'start' / 'epoch' / 'success' / 'error'), the current epoch and associated data (such as loss and accuracy) during the training |      |

Each `$training` event has the following signature:

```ts
interface TrainingStatus {
  status: 'idle' | 'start' | 'epoch' | 'success' | 'error';
  epoch?: number;
  epochs?: number;
  data?: Record<string, unknown>;
}
```

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

## TfImageClassifier

::: warning
TODO
:::
