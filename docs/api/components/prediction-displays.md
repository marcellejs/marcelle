---
sidebarDepth: 3
---

# Prediction displays

## confidencePlot

```tsx
marcelle.confidencePlot(
  predictionStream: Stream<Prediction>
): ConfidencePlot;
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
  <img src="./images/classificationPlot.png" alt="Screenshot of the classificationPlot component">
</div>

### Example

```js
const predictionStream = $features.map((feat) => classifier.predict(feat)).awaitPromises();

const plotResults = marcelle.confidencePlot(predictionStream);
```

## detectionBoxes

```tsx
marcelle.detectionBoxes(
  imgStream: Stream<ImageData>,
  objDectectionRes: Stream<ObjectDetectorResults>
): DetectionBoxes;
```

Plot detection boxes on an image given by a segmentation algorithm. `ObjectDetectorResults` has the following interface:

```ts
interface ObjectDetectorResults {
  outputs: {
    bbox: [number, number, number, number];
    class: string;
    confidence: number;
  }[];
}
```

### Parameters

| Option           | Type                            | Description                          | Required |
| ---------------- | ------------------------------- | ------------------------------------ | :------: |
| imgStream        | Stream\<ImageData\>             | A stream of image                    |    ✓     |
| objDectectionRes | Stream\<ObjectDetectorResults\> | A stream of object detection results |    ✓     |

### Example

```js
const source = imageUpload();
const cocoClassifier = cocoSsd();

// prediction using cocoSsd algorithm
const cocoPredictionStream = source.$images
  .map(async (img) => cocoClassifier.predict(img))
  .awaitPromises();

// build predictions
const cocoBetterPredictions = cocoPredictionStream.map(({ outputs }) => ({
  label: outputs[0].class,
  confidences: outputs.reduce((x, y) => ({ ...x, [y.class]: y.confidence }), {}),
}));

const objDetectionVis = detectionBoxes(source.$images, cocoPredictionStream);
```

## ConfusionMatrix

```tsx
marcelle.confusionMatrix(prediction: BatchPrediction): Confusion;
```

Displays a confusion matrix from a [BatchPrediction](#batchprediction) component.

### Parameters

| Option     | Type            | Description                                               | Required |
| ---------- | --------------- | --------------------------------------------------------- | :------: |
| prediction | BatchPrediction | A batch prediction component storing a set of predictions |    ✓     |

### Screenshot

<div style="background: rgb(237, 242, 247); padding: 8px; margin-top: 1rem;">
  <img src="./images/confusion-matrix.png" alt="Screenshot of the confusion-matrix component">
</div>

### Example

```js
const batchMLP = marcelle.batchPrediction({ name: 'mlp', dataStore: store });
const confusionMatrix = marcelle.confusionMatrix(batchMLP);
```
