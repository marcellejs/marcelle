---
'@marcellejs/core': minor
---

The `DatasetBrowser` component was improved so that only a few instances per class are loaded by default, and a button is available to view more.
The number of images per batch can be specified with the new `batchSize` option.

The previous behavior is available by using:

```js
datasetBrowser(trainingSet, { batchSize: 0 });
```
