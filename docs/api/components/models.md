---
sidebarDepth: 3
---

# Models

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
