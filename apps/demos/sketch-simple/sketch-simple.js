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

// Main components
const input = sketchPad();
const featureExtractor = mobileNet();
const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet', store);
const classifier = mlpClassifier({ layers: [64, 32], epochs: 20, dataStore: store });
classifier.sync('sketch-classifier');

// Additional widgets and visualizations
const classLabel = textInput();
classLabel.title = 'Label';
const captureButton = button('Capture this drawing');
const trainButton = button('Train the classifier');
const predictButton = button('Predict label');

const trainingSetBrowser = datasetBrowser(trainingSet);
const progress = trainingProgress(classifier);

// Dataset Pipeline
const $instances = captureButton.$click
  .sample(input.$images.zip((thumbnail, data) => ({ thumbnail, data }), input.$thumbnails))
  .map(async ({ thumbnail, data }) => ({
    x: await featureExtractor.process(data),
    y: classLabel.$value.value,
    thumbnail,
  }))
  .awaitPromises();

$instances.subscribe(trainingSet.create.bind(trainingSet));

// Training Pipeline
trainButton.$click.subscribe(() => classifier.train(trainingSet));

// Prediction Pipeline
const $features = predictButton.$click
  .sample(input.$images)
  .map((imgData) => featureExtractor.process(imgData))
  .awaitPromises();
//
const $predictions = $features.map((features) => classifier.predict(features)).awaitPromises();
//
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
