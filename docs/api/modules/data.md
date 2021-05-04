---
sidebarDepth: 1
---

# Data Management and UIs

## Dataset

```tsx
marcelle.dataset(name: string, dataStore?: DataStore): Dataset;
```

A Dataset module allowing for capturing instances from a stream, storing them in a local or remote [data-store](/api/data-stores.html).

### Parameters

| Option    | Type      | Description                                                                                                                                                   | Required |
| --------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| name      | string    | The dataset name                                                                                                                                              |    ✓     |
| dataStore | DataStore | The [dataStore](/api/data-stores) used to store the instances of the dataset. This parameter is optional. By default, a data store in memory will be created. |          |

### Streams

| Name        | Type                                  | Description                                                                                                                                                                                              | Hold |
| ----------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--: |
| \$count     | Stream\<number\>                      | Total number of instances in the dataset                                                                                                                                                                 |      |
| \$labels    | Stream\<string[]\>                    | Stream of labels currently in the dataset                                                                                                                                                                |      |
| \$classes   | Stream\<Record<string, ObjectId[]\>\> | Stream of objects associating each class label to the array of corresponding instance ids.                                                                                                               |      |
| \$instances | Stream\<ObjectId[]\>                  | Stream of all the ids of the instances contained in the dataset                                                                                                                                          |      |
| \$changes   | Stream\<DatasetChange\>               | Stream of changes applied to the dataset. Changes can concern a number of modifications (creation, update, deletion, ...) at various levels (dataset, class, instance). The interface is described below |      |

Where dataset changes have the following interface:

```ts
interface DatasetChange {
  level: 'instance' | 'dataset';
  type: 'created' | 'updated' | 'removed' | 'renamed';
  data?: any;
}
```

### Methods

#### .capture()

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
```

#### .items()

```tsx
items(): ServiceIterable<Instance>
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

#### .get()

```tsx
async get(id: ObjectId, params?: FeathersParams): Promise<Instance>
```

Get an instance from the dataset by ID, optionally passing Feathers parameters.

| Option | Type           | Description                                                                                              | Required |
| ------ | -------------- | -------------------------------------------------------------------------------------------------------- | :------: |
| id     | ObjectId       | The instance's unique ID                                                                                 |    ✓     |
| params | FeathersParams | Feathers Query parameters. See [Feathers docs](https://docs.feathersjs.com/api/databases/querying.html). |          |

#### .create()

```tsx
async create(instance: Instance, params?: FeathersParams): Promise<Instance>
```

Create an instance in the dataset

| Option   | Type           | Description                                                                                              | Required |
| -------- | -------------- | -------------------------------------------------------------------------------------------------------- | :------: |
| instance | Instance       | The instance data ID                                                                                     |    ✓     |
| params   | FeathersParams | Feathers Query parameters. See [Feathers docs](https://docs.feathersjs.com/api/databases/querying.html). |          |

#### .update()

```tsx
update(id: ObjectId, instance: Instance, params?: FeathersParams): Promise<Instance>
```

Update an instance in the dataset

| Option   | Type           | Description                                                                                              | Required |
| -------- | -------------- | -------------------------------------------------------------------------------------------------------- | :------: |
| id       | ObjectId       | The instance's unique ID                                                                                 |    ✓     |
| instance | Instance       | The instance data                                                                                        |    ✓     |
| params   | FeathersParams | Feathers Query parameters. See [Feathers docs](https://docs.feathersjs.com/api/databases/querying.html). |          |

#### .patch()

```tsx
patch(id: ObjectId, changes: Partial<Instance>, params?: FeathersParams): Promise<Instance>
```

Patch an instance in the dataset

| Option  | Type                | Description                                                                                              | Required |
| ------- | ------------------- | -------------------------------------------------------------------------------------------------------- | :------: |
| id      | ObjectId            | The instance's unique ID                                                                                 |    ✓     |
| changes | Partial\<Instance\> | The instance data                                                                                        |    ✓     |
| params  | FeathersParams      | Feathers Query parameters. See [Feathers docs](https://docs.feathersjs.com/api/databases/querying.html). |          |

#### .remove()

```tsx
remove(id: ObjectId, params?: FeathersParams): Promise<Instance>
```

Remove an instance from the dataset

| Option | Type           | Description                                                                                              | Required |
| ------ | -------------- | -------------------------------------------------------------------------------------------------------- | :------: |
| id     | ObjectId       | The instance's unique ID                                                                                 |    ✓     |
| params | FeathersParams | Feathers Query parameters. See [Feathers docs](https://docs.feathersjs.com/api/databases/querying.html). |          |

#### .renameClass()

```tsx
async renameClass(label: string, newLabel: string): Promise<void>
```

Change the label of a class in the dataset

| Option   | Type   | Description             | Required |
| -------- | ------ | ----------------------- | :------: |
| label    | string | the current class label |    ✓     |
| newLabel | string | the updated class label |    ✓     |

#### .removeClass()

```tsx
async removeClass(label: string): Promise<void>
```

Remove a class from the dataset

| Option | Type   | Description                      | Required |
| ------ | ------ | -------------------------------- | :------: |
| label  | string | the label of the class to remove |    ✓     |

#### .clear()

```tsx
async clear(): Promise<void>
```

Clear the dataset, removing all instances.

### Example

```js
const store = marcelle.dataStore('localStorage');
const trainingSet = marcelle.dataset('TrainingSet', store);
trainingSet.capture($instances); // Capture a Stream of instances
```

## DatasetBrowser

```tsx
marcelle.datasetBrowser(dataset: Dataset): Browser;
```

A Dataset browser provides an interface to visualize the contents of a dataset. It takes a dataset as argument, assuming that each instance contains a `thumbnail` property that can be displayed as an image (typically, a base64 dataURI).

### Parameters

| Option  | Type    | Description              | Required |
| ------- | ------- | ------------------------ | :------: |
| dataset | Dataset | The dataset to visualize |    ✓     |

### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/dataset-browser.png" alt="Screenshot of the datasetBrowser component">
</div>

### Example

```js
const trainingSetBrowser = marcelle.datasetBrowser(trainingSet);
dashboard.page('Data Management').use(trainingSetBrowser);
```
