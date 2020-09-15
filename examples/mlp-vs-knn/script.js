/* global marcelle, mostCore */

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
  .thru(mostCore.filter(() => capture.$down.value))
  .thru(
    mostCore.map(async (img) => ({
      type: 'image',
      data: img,
      label: label.$text.value,
      thumbnail: input.$thumbnails.value,
      features: await featureExtractor.process(img),
    })),
  )
  .thru(mostCore.awaitPromises);

const backend = marcelle.createBackend({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend });
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
const plotTrainingMLP = marcelle.trainingPlotter(classifierMLP);
plotTrainingMLP.name = 'MLP: Training Monitoring';

b.$click.subscribe(() => {
  classifierKNN.train(trainingSet);
  classifierMLP.train(trainingSet);
});

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = marcelle.batchPrediction({ name: 'mlp', backend });
const batchKNN = marcelle.batchPrediction({ name: 'knn', backend });
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
  .thru(mostCore.filter(() => tog.$checked.value))
  .thru(mostCore.map(async (img) => featureExtractor.process(img)))
  .thru(mostCore.awaitPromises);

const predictionStreamMLP = rtFeatureStream
  .thru(mostCore.map(async (features) => classifierMLP.predict(features)))
  .thru(mostCore.awaitPromises);
const predictionStreamKNN = rtFeatureStream
  .thru(mostCore.map(async (features) => classifierKNN.predict(features)))
  .thru(mostCore.awaitPromises);

const plotResultsMLP = marcelle.predictionPlotter(predictionStreamMLP);
plotResultsMLP.name = 'Predictions: MLP';
const plotResultsKNN = marcelle.predictionPlotter(predictionStreamKNN);
plotResultsKNN.name = 'Predictions: KNN';

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle Example - MLP vs KNN',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
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

dashboard.start();
