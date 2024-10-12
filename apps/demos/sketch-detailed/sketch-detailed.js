import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/gui-widgets/dist/marcelle-gui-widgets.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import {
  datasetBrowser,
  dataset,
  dataStore,
  mlpClassifier,
  mobileNet,
  confidencePlot,
  sketchPad,
  trainingPlot,
  batchPrediction,
  confusionMatrix,
  throwError,
} from '@marcellejs/core';
import {
  button,
  modelParameters,
  textInput,
  toggle,
  trainingProgress,
} from '@marcellejs/gui-widgets';
import { dashboard } from '@marcellejs/layouts';
import { filter, from, map, mergeMap, withLatestFrom, zip } from 'rxjs';

// Main components
const input = sketchPad();
const featureExtractor = mobileNet();
const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet', store);
const classifier = mlpClassifier({ layers: [64, 32], epochs: 20 }).sync(store, 'sketch-classifier');
const batchResults = batchPrediction('mlp', store);

// Additional widgets and visualizations
const classLabel = textInput();
const captureButton = button('Capture this drawing');
const trainButton = button('Train the classifier');
const batchPredictButton = button('Update batch predictions on the training dataset');
const realTimePredictToggle = toggle('Toggle real-time prediction');

const trainingSetBrowser = datasetBrowser(trainingSet);
const classifierParams = modelParameters(classifier);
const progress = trainingProgress(classifier);
const lossCurves = trainingPlot(classifier);
const confusion = confusionMatrix(batchResults);

// Dataset Pipeline
const $instances = captureButton.$click.pipe(
  withLatestFrom(zip(input.$images, input.$thumbnails)),
  map((x) => x[1]),
  map(async ([img, thumbnail]) => ({
    x: await featureExtractor.process(img),
    y: classLabel.$value.getValue(),
    thumbnail,
  })),
  mergeMap((x) => from(x)),
);

$instances.subscribe(trainingSet.create);

// Training Pipeline
trainButton.$click.subscribe(() => classifier.train(trainingSet));

// Real-time Prediction Pipeline
const $features = input.$images.pipe(
  filter(() => realTimePredictToggle.$checked.getValue() && classifier.ready),
  map((img) => featureExtractor.process(img)),
  mergeMap((x) => from(x)),
);

const $predictions = $features.pipe(
  map((features) => classifier.predict(features)),
  mergeMap((x) => from(x)),
);

const predictionViz = confidencePlot($predictions);

// Batch Prediction Pipeline
batchPredictButton.$click.subscribe(async () => {
  if (!classifier.ready) {
    throwError(new Error('No classifier has been trained'));
  }
  await batchResults.clear();
  await batchResults.predict(classifier, trainingSet);
});

// Dashboard definition
const myDashboard = dashboard({ title: 'Sketch App (v1++)', author: 'Suzanne' });

myDashboard
  .page('Data Management')
  .sidebar(input, featureExtractor)
  .use([classLabel, captureButton], trainingSetBrowser);
myDashboard.page('Training').use(classifierParams, trainButton, progress, lossCurves);
myDashboard.page('Batch Prediction').use(batchPredictButton, confusion);
myDashboard.page('Real-time Prediction').sidebar(input).use(realTimePredictToggle, predictionViz);

myDashboard.settings.dataStores(store).datasets(trainingSet).models(classifier);

myDashboard.show();
