/* eslint-disable import/extensions */
import '../../dist/marcelle.css';
import {
  batchPrediction,
  datasetBrowser,
  button,
  confusionMatrix,
  dashboard,
  dataset,
  dataStore,
  mlp,
  mobilenet,
  parameters,
  classificationPlot,
  trainingProgress,
  textfield,
  toggle,
  trainingPlot,
  webcam,
  knn,
  text,
} from '../../dist/marcelle.esm.js';

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobilenet();

const label = textfield();
label.title = 'Instance label';
const capture = button({ text: 'Hold to record instances' });
capture.title = 'Capture instances to the training set';

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
const trainingSet = dataset({ name: 'TrainingSet-dashboard', dataStore: store });
trainingSet.capture(instances);

const trainingSetBrowser = datasetBrowser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
b.title = 'Training Launcher';

// KNN
const classifierKNN = knn({ k: 3, dataStore: store }).sync('mlp-vs-knn-knn');
const paramsKNN = parameters(classifierKNN);
paramsKNN.title = 'KNN: Parameters';
const progressKNN = trainingProgress(classifierKNN);
progressKNN.title = 'KNN: Training Progress';

// MLP
const classifierMLP = mlp({ layers: [128, 64], epochs: 30, dataStore: store }).sync(
  'mlp-vs-knn-mlp',
);
const paramsMLP = parameters(classifierMLP);
paramsMLP.title = 'MLP: Parameters';
const progressMLP = trainingProgress(classifierMLP);
progressMLP.title = 'MLP: Training Progress';
const plotTrainingMLP = trainingPlot(classifierMLP);
plotTrainingMLP.title = 'MLP: Training Monitoring';

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
const confusionMLP = confusionMatrix(batchMLP);
confusionMLP.title = 'MLP: Confusion Matrix';
const confusionKNN = confusionMatrix(batchKNN);
confusionKNN.title = 'KNN: Confusion Matrix';

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

const plotResultsMLP = classificationPlot(predictionStreamMLP);
plotResultsMLP.title = 'Predictions: MLP';
const plotResultsKNN = classificationPlot(predictionStreamKNN);
plotResultsKNN.title = 'Predictions: KNN';

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
dash.settings.dataStores(store).datasets(trainingSet).models(classifierKNN, classifierMLP);

dash.start();
