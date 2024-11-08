import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/gui-widgets/dist/marcelle-gui-widgets.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import {
  datasetBrowser,
  dataset,
  dataStore,
  confidencePlot,
  sketchPad,
  notification,
} from '@marcellejs/core';
import { mlpClassifier, mobileNet } from '@marcellejs/tensorflow';
import { button, textInput, trainingProgress } from '@marcellejs/gui-widgets';
import { dashboard } from '@marcellejs/layouts';
import { filter, from, map, mergeMap, mergeWith, withLatestFrom, take, zip, tap } from 'rxjs';

// Main components
const input = sketchPad();
const featureExtractor = mobileNet();
const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet', store);
const classifier = mlpClassifier({ layers: [64, 32], epochs: 20 }).sync(store, 'sketch-classifier');

// Additional widgets and visualizations
const classLabel = textInput();
const captureButton = button('Capture this drawing and retrain');

const trainingSetBrowser = datasetBrowser(trainingSet);
const progress = trainingProgress(classifier);

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
trainingSet.$changes.subscribe(async (changes) => {
  await trainingSet.ready;
  const labels = await trainingSet.distinct('y');
  if (changes.length === 0 || changes[0].level === 'dataset') return;
  if (labels.length < 2) {
    notification({
      title: 'Tip',
      message: 'You need to have at least two classes to train the model',
      duration: 5000,
    });
  } else if (trainingSet.$count.getValue() < 4) {
    notification({
      title: 'Tip',
      message: 'You need to have at least two example in each class',
      duration: 5000,
    });
  } else {
    classifier.train(trainingSet);
  }
});

// Prediction Pipeline (Online)
const $features = input.$images.pipe(
  map(featureExtractor.process),
  mergeMap((x) => from(x)),
);

const $trainingSuccess = classifier.$training.pipe(filter((x) => x.status === 'success'));

const $predictions = $features.pipe(
  mergeWith($trainingSuccess.pipe(withLatestFrom($features, (x, y) => y))),
  tap((x) => {
    console.log('feats', x);
  }),
  map(classifier.predict),
  mergeMap((x) => from(x)),
);

const predictionViz = confidencePlot($predictions);

$predictions.subscribe(({ label }) => {
  classLabel.$value.next(label);
});

// Dashboard definition
const myDashboard = dashboard({ title: 'Sketch App (v2)', author: 'Suzanne' });

myDashboard
  .page('Main')
  .sidebar(input, featureExtractor)
  .use(predictionViz, [classLabel, captureButton], progress, trainingSetBrowser);

myDashboard.settings.dataStores(store).datasets(trainingSet).models(classifier);

myDashboard.show();

// Help messages

input.$images
  .pipe(
    filter(() => trainingSet.$count.getValue() === 0 && !classifier.ready),
    take(1),
  )
  .subscribe(() => {
    notification({
      title: 'Tip',
      message: 'Start by editing the label and adding the drawing to the dataset',
      duration: 5000,
    });
  });
