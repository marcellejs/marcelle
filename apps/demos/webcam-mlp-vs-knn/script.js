import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/gui-widgets/dist/marcelle-gui-widgets.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import {
  batchPrediction,
  datasetBrowser,
  confusionMatrix,
  dataset,
  dataStore,
  confidencePlot,
  trainingPlot,
  webcam,
} from '@marcellejs/core';
import { knnClassifier, mlpClassifier, mobileNet } from '@marcellejs/tensorflow';
import {
  button,
  modelParameters,
  text,
  textInput,
  toggle,
  trainingProgress,
} from '@marcellejs/gui-widgets';
import { dashboard } from '@marcellejs/layouts';
import { filter, from, map, mergeMap, zip } from 'rxjs';

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

const $instances = zip(input.$images, input.$thumbnails).pipe(
  filter(() => capture.$pressed.getValue()),
  map(async ([img, thumbnail]) => ({
    x: await featureExtractor.process(img),
    y: label.$value.getValue(),
    thumbnail,
  })),
  mergeMap((x) => from(x)),
);

$instances.subscribe(trainingSet.create);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button('Train');
b.title = 'Training Launcher';

// KNN
const classifierKNN = knnClassifier({ k: 3 }).sync(store, 'mlp-vs-knn-knn');
const paramsKNN = modelParameters(classifierKNN);
paramsKNN.title = 'KNN: Parameters';
const progressKNN = trainingProgress(classifierKNN);
progressKNN.title = 'KNN: Training Progress';

// MLP
const classifierMLP = mlpClassifier({ layers: [128, 64], epochs: 30 }).sync(
  store,
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

const batchMLP = batchPrediction('mlp', store);
const batchKNN = batchPrediction('knn', store);
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

const $features = input.$images.pipe(
  filter(() => tog.$checked.getValue()),
  map(async (img) => featureExtractor.process(img)),
  mergeMap((x) => from(x)),
);

const $predictionsMLP = $features.pipe(
  map(classifierMLP.predict),
  mergeMap((x) => from(x)),
);
const $predictionsKNN = $features.pipe(
  map(classifierKNN.predict),
  mergeMap((x) => from(x)),
);

const plotResultsMLP = confidencePlot($predictionsMLP);
plotResultsMLP.title = 'Predictions: MLP';
const plotResultsKNN = confidencePlot($predictionsKNN);
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
