/* eslint-disable import/extensions */
import {
  batchPrediction,
  browser,
  button,
  confusion,
  dashboard,
  dataset,
  dataStore,
  mlp,
  mobilenet,
  parameters,
  predictionPlot,
  progress,
  textfield,
  toggle,
  trainingPlot,
  webcam,
  knn,
  text,
} from '../../dist/marcelle.bundle.esm.js';

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobilenet();

const label = textfield();
label.name = 'Instance label';
const capture = button({ text: 'Hold to record instances' });
capture.name = 'Capture instances to the training set';

const instances = input.$images
  .filter(() => capture.$down.value)
  .map(async (img) => ({
    type: 'image',
    data: img,
    label: label.$text.value,
    thumbnail: input.$thumbnails.value,
    features: await featureExtractor.process(img),
  }))
  .awaitPromises();

const store = dataStore({ location: 'localStorage' });
const trainingSet = dataset({ name: 'TrainingSet', dataStore: store });
trainingSet.capture(instances);

const trainingSetBrowser = browser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
b.name = 'Training Launcher';

// KNN
const classifierKNN = knn({ k: 3 });
const paramsKNN = parameters(classifierKNN);
paramsKNN.name = 'KNN: Parameters';
const progressKNN = progress(classifierKNN);
progressKNN.name = 'KNN: Training Progress';

// MLP
const classifierMLP = mlp({ layers: [128, 64], epochs: 30 });
const paramsMLP = parameters(classifierMLP);
paramsMLP.name = 'MLP: Parameters';
const progressMLP = progress(classifierMLP);
progressMLP.name = 'MLP: Training Progress';
const plotTrainingMLP = trainingPlot(classifierMLP);
plotTrainingMLP.name = 'MLP: Training Monitoring';

b.$click.subscribe(() => {
  classifierKNN.train(trainingSet);
  classifierMLP.train(trainingSet);
});

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction({ name: 'mlp', dataStore: store });
const batchKNN = batchPrediction({ name: 'knn', dataStore: store });
const predictButton = button({ text: 'Update predictions' });
const predictionAccuracy = text({ text: 'Waiting for predictions...' });
const confusionMLP = confusion(batchMLP);
confusionMLP.name = 'MLP: Confusion Matrix';
const confusionKNN = confusion(batchKNN);
confusionKNN.name = 'KNN: Confusion Matrix';

predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifierMLP, trainingSet);
  await batchKNN.clear();
  await batchKNN.predict(classifierKNN, trainingSet);
});

// -----------------------------------------------------------
// PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });

const rtFeatureStream = input.$images
  .filter(() => tog.$checked.value)
  .map(async (img) => featureExtractor.process(img))
  .awaitPromises();

const predictionStreamMLP = rtFeatureStream
  .map(async (features) => classifierMLP.predict(features))
  .awaitPromises();
const predictionStreamKNN = rtFeatureStream
  .map(async (features) => classifierKNN.predict(features))
  .awaitPromises();

const plotResultsMLP = predictionPlot(predictionStreamMLP);
plotResultsMLP.name = 'Predictions: MLP';
const plotResultsKNN = predictionPlot(predictionStreamKNN);
plotResultsKNN.name = 'Predictions: KNN';

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - MLP vs KNN',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Data Management')
  .useLeft(input, featureExtractor)
  .use([label, capture], trainingSetBrowser);
dash
  .page('Training')
  .use(
    b,
    'KNN (k-Nearest Neighbors)',
    paramsKNN,
    progressKNN,
    'MLP (Multilayer Perceptron)',
    paramsMLP,
    progressMLP,
    plotTrainingMLP,
  );
dash.page('Batch Prediction').use(predictButton, predictionAccuracy, [confusionMLP, confusionKNN]);
dash.page('Real-time prediction').useLeft(input).use(tog, [plotResultsMLP, plotResultsKNN]);
dash.settings.use(trainingSet);

dash.start();
