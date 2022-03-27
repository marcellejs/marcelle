import '@marcellejs/core/dist/marcelle.css';
import {
  batchPrediction,
  datasetBrowser,
  button,
  confusionMatrix,
  dashboard,
  dataset,
  dataStore,
  mlpClassifier,
  mobileNet,
  modelParameters,
  confidencePlot,
  trainingProgress,
  textInput,
  toggle,
  trainingPlot,
  webcam,
  knnClassifier,
  text,
} from '@marcellejs/core';

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobileNet();

const label = textInput();
label.title = 'Instance label';
const capture = button('Hold to record instances');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('training-set-mlp-vs-knn', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

input.$images
  .filter(() => capture.$pressed.value)
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    thumbnail: input.$thumbnails.value,
    y: label.$value.value,
  }))
  .awaitPromises()
  .subscribe(trainingSet.create.bind(trainingSet));

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button('Train');
b.title = 'Training Launcher';

// KNN
const classifierKNN = knnClassifier({ k: 3, dataStore: store }).sync('mlp-vs-knn-knn');
const paramsKNN = modelParameters(classifierKNN);
paramsKNN.title = 'KNN: Parameters';
const progressKNN = trainingProgress(classifierKNN);
progressKNN.title = 'KNN: Training Progress';

// MLP
const classifierMLP = mlpClassifier({ layers: [128, 64], epochs: 30, dataStore: store }).sync(
  'mlp-vs-knn-mlp',
);
const paramsMLP = modelParameters(classifierMLP);
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
const predictButton = button('Update predictions');
const predictionAccuracy = text('Waiting for predictions...');
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

const tog = toggle('toggle prediction');

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

const plotResultsMLP = confidencePlot(predictionStreamMLP);
plotResultsMLP.title = 'Predictions: MLP';
const plotResultsKNN = confidencePlot(predictionStreamKNN);
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
  .sidebar(input, featureExtractor)
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
dash.page('Real-time prediction').sidebar(input).use(tog, [plotResultsMLP, plotResultsKNN]);
dash.settings.dataStores(store).datasets(trainingSet).models(classifierKNN, classifierMLP);

dash.show();
