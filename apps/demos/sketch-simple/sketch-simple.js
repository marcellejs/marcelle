import '@marcellejs/core/dist/marcelle.css';
import {
  datasetBrowser,
  button,
  dashboard,
  dataset,
  dataStore,
  mlpClassifier,
  mobileNet,
  confidencePlot,
  sketchPad,
  textInput,
  trainingProgress,
} from '@marcellejs/core';
import { from, map, mergeMap, sample, withLatestFrom, zip } from 'rxjs';

// Main components
const input = sketchPad();
const featureExtractor = mobileNet();
const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet', store);
const classifier = mlpClassifier({ layers: [64, 32], epochs: 20 }).sync(store, 'sketch-classifier');

// Additional widgets and visualizations
const classLabel = textInput();
classLabel.title = 'Label';
const captureButton = button('Capture this drawing');
const trainButton = button('Train the classifier');
const predictButton = button('Predict label');

const trainingSetBrowser = datasetBrowser(trainingSet);
const progress = trainingProgress(classifier);

// Dataset Pipeline
const $instances = zip(input.$images, input.$thumbnails).pipe(
  sample(captureButton.$click),
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

// Prediction Pipeline
const $features = predictButton.$click.pipe(
  withLatestFrom(input.$images),
  map((x) => x[1]),
  map((imgData) => featureExtractor.process(imgData)),
  mergeMap((x) => from(x)),
);

const $predictions = $features.pipe(
  map(classifier.predict),
  mergeMap((x) => from(x)),
);

const predictionViz = confidencePlot($predictions);

// Dashboard definition
const myDashboard = dashboard({ title: 'Sketch App (v1)', author: 'Suzanne' });

myDashboard
  .page('Main')
  .sidebar(input, featureExtractor)
  .use([classLabel, captureButton], trainingSetBrowser, trainButton, progress, [
    predictButton,
    predictionViz,
  ]);

myDashboard.settings.dataStores(store).datasets(trainingSet).models(classifier);

myDashboard.show();
