---
sidebarDepth: 1
---

# Predictions

## BatchPrediction

```tsx
marcelle.batchPrediction({ name: string, dataStore?: DataStore }): BatchPrediction;
```

This module allows to compute and store batch predictions with a given model over an entire dataset. Similarly to [Datasets](/api/modules/data.html#dataset), the prediction results are stored in a data store passed in argument.

### Parameters

| Option    | Type      | Description                                                                                                                                                        | Required |
| --------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| name      | string    | The name of the predictions (for data storage)                                                                                                                     |    ✓     |
| dataStore | DataStore | The [dataStore](/api/data-stores.html) used to store the instances of the dataset. This parameter is optional. By default, a data store in memory will be created. |          |

### Streams

| Name          | Type                 | Description                                                       | Hold |
| ------------- | -------------------- | ----------------------------------------------------------------- | :--: |
| \$predictions | Stream\<ObjectId[]\> | Stream of all the ids of the predictions stored in the data store |  ✓   |
| \$count       | Stream\<number\>     | Total number of predictions                                       |  ✓   |

### Methods

#### .predict()

```tsx
async predict(model: Model, dataset: Dataset, inputField = 'features'): Promise<void>
```

Compute predictions for all instances of a given [Datasets](/api/modules/data.html#dataset) `dataset`, using a trained `model`. The instance field used for predictions can be specified with the `inputField` parameters, that defaults to `features`.

#### .clear()

```tsx
async clear(): Promise<void>
```

Clear all predictions from the data store, resetting the resulting streams.

### Example

```js
const classifier = marcelle.mlp({ layers: [64, 32], epochs: 20 });

const batchMLP = marcelle.batchPrediction({ name: 'mlp', dataStore: store });

const predictButton = marcelle.button({ text: 'Update predictions' });
predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});
```

## Confusion

```tsx
marcelle.confusion(prediction: BatchPrediction): Confusion;
```

Displays a confusion matrix from a [BatchPrediction](#batchprediction) module.

### Parameters

| Option     | Type            | Description                                            | Required |
| ---------- | --------------- | ------------------------------------------------------ | :------: |
| prediction | BatchPrediction | A batch prediction module storing a set of predictions |    ✓     |

### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/confusion.png" alt="Screenshot of the confusion component">
</div>

### Example

```js
const batchMLP = marcelle.batchPrediction({ name: 'mlp', dataStore: store });
const confusionMatrix = marcelle.confusion(batchMLP);
```

## PredictionPlot

```tsx
marcelle.predictionPlot(
  predictionStream: Stream<Prediction>
): PredictionPlot;
```

Plot prediction result in real-time from a reactive stream of predictions, where each event implements the following interface:

```ts
interface Prediction {
  id?: ObjectId;
  instanceId: ObjectId;
  label?: string;
  trueLabel?: string;
  confidences?: Record<string, number>;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
```

### Parameters

| Option           | Type                 | Description                    | Required |
| ---------------- | -------------------- | ------------------------------ | :------: |
| predictionStream | Stream\<Prediction\> | a stream of Prediction objects |    ✓     |

### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/predictionPlot.png" alt="Screenshot of the predictionPlot component">
</div>

### Example

```js
const predictionStream = $features.map((feat) => classifier.predict(feat)).awaitPromises();

const plotResults = marcelle.predictionPlot(predictionStream);
```

## VisObjectDetection

::: warning TODO
TODO
:::
