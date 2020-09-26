---
sidebarDepth: 1
---

# Data Management

## Dataset

```tsx
marcelle.dataset({ name: string, backend?: Backend }): Dataset;
```

A Dataset module allowing for capturing instances from a stream, storing them in a local or remote [backend](/api/backends).

### Parameters

| Option  | Type    | Description                                                                                                                                           | Required |
| ------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| name    | string  | The dataset name                                                                                                                                      |    ✓     |
| backend | Backend | The [backend](/api/backends) used to store the instances of the dataset. This parameter is optional. By default, a backend in memory will be created. |          |

### Streams

| Name            | Type                                  | Description                                                                                | Hold |
| --------------- | ------------------------------------- | ------------------------------------------------------------------------------------------ | :--: |
| \$created       | Stream\<ObjectId\>                    | Stream of containg the ID at each newly created instance                                   |      |
| \$instances     | Stream\<ObjectId[]\>                  | Stream of all the ids of the instances contained in the dataset                            |      |
| \$classes       | Stream\<Record<string, ObjectId[]\>\> | Stream of objects associating each class label to the array of corresponding instance ids. |      |
| \$labels        | Stream\<string[]\>                    | Stream of labels currently in the dataset                                                  |      |
| \$count         | Stream\<number\>                      | Total number of instances in the dataset                                                   |      |
| \$countPerClass | Stream\<Record<string, number\>\>     | The number of instances per class                                                          |      |

### Example

```js
const backend = marcelle.createBackend({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend });
trainingSet.capture($instances); // Capture a Stream of instances
```

## Browser

```tsx
marcelle.browser(dataset: Dataset): Browser;
```

A Dataset browser provides an interface to visualize the contents of a dataset. It takes a dataset as argument, assuming that each instance contains a `thumbnail` property that can be displayed as an image (typically, a base64 dataURI).

### Parameters

| Option  | Type    | Description              | Required |
| ------- | ------- | ------------------------ | :------: |
| dataset | Dataset | The dataset to visualize |    ✓     |

### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/browser.png" alt="Screenshot of the browser component">
</div>

### Example

```js
const trainingSetBrowser = marcelle.browser(trainingSet);
dashboard.page('Data Management').use(trainingSetBrowser);
```
