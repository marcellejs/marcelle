---
sidebarDepth: 3
---

# Models

Models are standard Marcelle components with two additional characteristics. First, they have a property called `parameters`, which is a record of parameter values as streams. This structure is useful to provide interfaces that dynamically change the values of the model parameters. Second, they carry a set of methods for training and prediction. Some methods are standardized, such as `.train(dataset)` and `.predict(features)`, however models can expose additional specific methods.

## Interface

Models implement the following interface:

```ts
interface Model<InputType, OutputType, PredictionType> {
  parameters: {
    [name: string]: Stream<any>;
  };

  $training: Stream<TrainingStatus>;

  train(
    dataset: Dataset<InputType, OutputType> | ServiceIterable<Instance<InputType, OutputType>>,
    validationDataset?:
      | Dataset<InputType, OutputType>
      | ServiceIterable<Instance<InputType, OutputType>>,
  ): void;
  predict(x: InputType): Promise<PredictionType>;

  save(
    store: DataStore,
    name: string,
    metadata?: Record<string, unknown>,
    id?: ObjectId,
  ): Promise<ObjectId | null>;
  load(store: DataStore, idOrName: ObjectId | string): Promise<StoredModel>;
  download(metadata?: Record<string, unknown>): Promise<void>;
  upload(...files: File[]): Promise<StoredModel>;
  sync(store: DataStore, name: string): this;
}
```

## Streams

Models expose a `$training` stream that monitors the training process. Each `TrainingStatus` event has the following interface:

```ts
interface TrainingStatus {
  status: 'idle' | 'start' | 'epoch' | 'success' | 'error' | 'loaded' | 'loading';
  epoch?: number;
  epochs?: number;
  data?: Record<string, unknown>;
}
```

Where the `data` field varies across models to include additional information, such as the training and validation loss/accuracy in the case of neural networks.

## Common Methods

### .train()

```tsx
train(
  dataset: Dataset<InputType, OutputType> | ServiceIterable<Instance<InputType, OutputType>>,
  validationDataset?:
    | Dataset<InputType, OutputType>
    | ServiceIterable<Instance<InputType, OutputType>>,
): void;
```

Train the model from a given dataset or dataset iterator. An optional validation set can be passed. The training can be monitored using the model's `$training` stream.

#### Parameters

| Option            | Type | Description                                                                                                                                                                                                                             | Required | Default |
| ----------------- | ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: | ------- |
| dataset           | TODO | A Marcelle [Dataset](/api/data-storage.html#dataset) or an iterator (TODO: undocumented) for training.                                                                                                                                  |    ✔    |         |
| validationDataset | TODO | A Marcelle [Dataset](/api/data-storage.html#dataset) or an iterator (TODO: undocumented) used for validation. If not defined, the validation datasets will be created automatically according to the model's validationSplit parameter. |          |         |

### .predict()

```tsx
predict(x: InputType): Promise<PredictionType>;
```

Make a prediction from a single input frame. Input and output formats vary across models, refer to each model's specific [documentation](/api/components/models.html).

#### Parameters

| Option | Type      | Description                 | Required | Default |
| ------ | --------- | --------------------------- | :------: | ------- |
| x      | InputType | a single input to the model |    ✔    |         |

#### Returns

A promise that resolves with the resulting prediction.

### .save()

```tsx
abstract save(
  store: DataStore,
  name: string,
  metadata?: Record<string, unknown>,
  id?: ObjectId,
): Promise<ObjectId | null>;
```

Save the model to a data store with a given name and optional metadata. If the id of an existing model is passed it will be updated.

#### Parameters

| Option   | Type                      | Description                                                                  | Required | Default |
| -------- | ------------------------- | ---------------------------------------------------------------------------- | :------: | ------- |
| store    | DataStore                 | The data store to save the model                                             |    ✔    |         |
| name     | string                    | The name of the model                                                        |    ✔    |         |
| metadata | Record\<string, unknown\> | An optional object containing metadata about the model                       |          |         |
| id       | ObjectId                  | The id of an existing model. If defined, the existing model will be updated. |          |         |

#### Returns

A promise that resolves with the ObjectId of the document in the data store, or null is the saving failed.

### .load()

```tsx
load(store: DataStore, idOrName: ObjectId | string): Promise<StoredModel>;
```

Load a model from a data store from either its id or its name.

#### Parameters

| Option | Type               | Description                                                                                                                                            | Required | Default |
| ------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: | ------- |
| store  | DataStore          | The data store from which to load the model                                                                                                            |    ✔    |         |
| id     | ObjectId \| string | The ID of the model's document in the data store, or its name. If several models in the data store have the same name, the latest model will be loaded |    ✔    |         |

#### Returns

A promise that resolves with the the `StoredModel` document from the data store, which has the following interface:

```ts
interface StoredModel {
  id?: ObjectId;
  name: string;
  url: string;
  metadata?: Record<string, unknown>;
}
```

### .download()

```tsx
download(metadata?: Record<string, unknown>): Promise<void>;
```

Download a model as files, with optional custom metadata.

#### Parameters

| Option   | Type   | Description                                                    | Required | Default |
| -------- | ------ | -------------------------------------------------------------- | :------: | ------- |
| metadata | object | A JSON-serializable object containing arbitrary model metadata |          | {}      |

### .upload()

```tsx
upload(...files: File[]): Promise<StoredModel>;
```

Upload a model from a set of files. Files should be exported from Marcelle by the same model class.

#### Parameters

| Option | Type   | Description                                                                                                             | Required | Default |
| ------ | ------ | ----------------------------------------------------------------------------------------------------------------------- | :------: | ------- |
| files  | File[] | A list of files constituting the model (for instance, a `model.json` and a set of `.bin` weight files for a TFJS model) |          | {}      |

### .sync()

```tsx
sync(store: DataStore, name: string): this;
```

Synchronize a model with a data store, given a model name. The model will be automatically updated in the store whenever its training ends, or it is loaded from files. The model will be automatically restored on startup, from the latest version available in the store.

#### Parameters

| Option | Type      | Description                                                              | Required | Default |
| ------ | --------- | ------------------------------------------------------------------------ | :------: | ------- |
| store  | DataStore | The data store where the model should be synchronize                     |    ✔    |         |
| name   | string    | A unique name for the model so that it can be retrieved in the datastore |    ✔    |         |

## BatchPrediction

```tsx
batchPrediction(name: string, dataStore?: DataStore): BatchPrediction;
```

This component allows to compute and store batch predictions with a given model over an entire dataset. Similarly to [Datasets](/api/data-storage.html#dataset), the prediction results are stored in a data store passed in argument.

### Parameters

| Option    | Type      | Description                                                                                                                                                                   | Required |
| --------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| name      | string    | The name of the predictions (for data storage)                                                                                                                                |    ✓     |
| dataStore | DataStore | The [dataStore](/api/data-storage.html#datastore) used to store the instances of the dataset. This parameter is optional. By default, a data store in memory will be created. |          |

### Streams

| Name     | Type                            | Description                                                  | Hold |
| -------- | ------------------------------- | ------------------------------------------------------------ | :--: |
| \$status | Stream\<BatchPredictionStatus\> | Stream containing the status of the batch prediction process |  ✓   |

```ts
export interface BatchPredictionStatus {
  status: 'idle' | 'start' | 'running' | 'success' | 'error' | 'loaded' | 'loading';
  count?: number;
  total?: number;
  data?: Record<string, unknown>;
}
```

### Methods

#### .predict()

```tsx
async predict(model: Model, dataset: Dataset, inputField = 'features'): Promise<void>
```

Compute predictions for all instances of a given [Datasets](/api/data-storage.html#dataset) `dataset`, using a trained `model`. The instance field used for predictions can be specified with the `inputField` parameters, that defaults to `features`.

#### .clear()

```tsx
async clear(): Promise<void>
```

Clear all predictions from the data store, resetting the resulting streams.

### Example

```js
const classifier = marcelle.mlp({ layers: [64, 32], epochs: 20 });

const batchMLP = marcelle.batchPrediction('mlp', store);

const predictButton = marcelle.button('Update predictions');
predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});
```
