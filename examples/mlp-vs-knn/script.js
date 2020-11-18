/* global marcelle */

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const input = marcelle.webcam();
const featureExtractor = marcelle.mobilenet();

const label = marcelle.textfield();
label.name = 'Instance label';
const capture = marcelle.button({ text: 'Hold to record instances' });
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

const store = marcelle.dataStore({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', dataStore: store });
trainingSet.capture(instances);

const trainingSetBrowser = marcelle.browser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = marcelle.button({ text: 'Train' });
b.name = 'Training Launcher';

// KNN
const classifierKNN = marcelle.knn({ k: 3 });
const paramsKNN = marcelle.parameters(classifierKNN);
paramsKNN.name = 'KNN: Parameters';
const progressKNN = marcelle.progress(classifierKNN);
progressKNN.name = 'KNN: Training Progress';

// MLP
const classifierMLP = marcelle.mlp({ layers: [128, 64], epochs: 30 });
const paramsMLP = marcelle.parameters(classifierMLP);
paramsMLP.name = 'MLP: Parameters';
const progressMLP = marcelle.progress(classifierMLP);
progressMLP.name = 'MLP: Training Progress';
const plotTrainingMLP = marcelle.trainingPlot(classifierMLP);
plotTrainingMLP.name = 'MLP: Training Monitoring';

b.$click.subscribe(() => {
  classifierKNN.train(trainingSet);
  classifierMLP.train(trainingSet);
});

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = marcelle.batchPrediction({ name: 'mlp', dataStore: store });
const batchKNN = marcelle.batchPrediction({ name: 'knn', dataStore: store });
const predictButton = marcelle.button({ text: 'Update predictions' });
const predictionAccuracy = marcelle.text({ text: 'Waiting for predictions...' });
const confusionMLP = marcelle.confusion(batchMLP);
confusionMLP.name = 'MLP: Confusion Matrix';
const confusionKNN = marcelle.confusion(batchKNN);
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

const tog = marcelle.toggle({ text: 'toggle prediction' });

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

const plotResultsMLP = marcelle.predictionPlot(predictionStreamMLP);
plotResultsMLP.name = 'Predictions: MLP';
const plotResultsKNN = marcelle.predictionPlot(predictionStreamKNN);
plotResultsKNN.name = 'Predictions: KNN';

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.dashboard({
  title: 'Marcelle Example - MLP vs KNN',
  author: 'Marcelle Pirates Crew',
});

dashboard
  .page('Data Management')
  .useLeft(input, featureExtractor)
  .use([label, capture], trainingSetBrowser);
dashboard
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
dashboard
  .page('Batch Prediction')
  .use(predictButton, predictionAccuracy, [confusionMLP, confusionKNN]);
dashboard.page('Real-time prediction').useLeft(input).use(tog, [plotResultsMLP, plotResultsKNN]);
dashboard.settings.use(trainingSet);

dashboard.start();
