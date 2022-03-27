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
  toggle,
  modelParameters,
  trainingProgress,
  trainingPlot,
  batchPrediction,
  confusionMatrix,
  throwError,
} from '@marcellejs/core';

// Main components
const input = sketchPad();
const featureExtractor = mobileNet();
const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet', store);
const classifier = mlpClassifier({ layers: [64, 32], epochs: 20, dataStore: store });
classifier.sync('sketch-classifier');
const batchResults = batchPrediction({ name: 'mlp', dataStore: store });

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

// Real-time Prediction Pipeline
const $features = input.$images
  .filter(() => realTimePredictToggle.$checked.value && classifier.ready)
  .map((img) => featureExtractor.process(img))
  .awaitPromises();

const $predictions = $features.map((features) => classifier.predict(features)).awaitPromises();

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
