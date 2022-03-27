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
  notification,
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
const captureButton = button('Capture this drawing');

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
  } else if (trainingSet.$count.value < 4) {
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
const $features = input.$images.map((imgData) => featureExtractor.process(imgData)).awaitPromises();

const $trainingSuccess = classifier.$training.filter((x) => x.status === 'success');

const $predictions = $features
  .merge($trainingSuccess.sample($features))
  .map((features) => classifier.predict(features))
  .awaitPromises();

const predictionViz = confidencePlot($predictions);

$predictions.subscribe(({ label }) => {
  classLabel.$value.set(label);
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
  .filter(() => trainingSet.$count.value === 0 && !classifier.ready)
  .take(1)
  .subscribe(() => {
    notification({
      title: 'Tip',
      message: 'Start by editing the label and adding the drawing to the dataset',
      duration: 5000,
    });
  });
