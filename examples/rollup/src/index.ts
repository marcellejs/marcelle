import {
  browser,
  webcam,
  mobilenet,
  dataset,
  button,
  parameters,
  progress,
  toggle,
  mlp,
  createBackend,
  createDashboard,
  textfield,
  trainingPlot,
  batchPrediction,
  confusion,
  predictionPlot,
  account,
  Prediction,
  Stream,
  Instance,
} from '@marcellejs/core';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobilenet();

const label = textfield();
label.name = 'Instance label';
const capture = button({ text: 'Hold to record instances' });
capture.name = 'Capture instances to the training set';

const instances = input.$images
  .filter(() => capture.$down.value)
  .map(async (img: ImageData) => ({
    type: 'image',
    data: img,
    label: label.$text.value,
    thumbnail: input.$thumbnails.value,
    features: await featureExtractor.process(img),
  }))
  .awaitPromises();

// const backend = createBackend({ location: 'http://localhost:3030/', auth: true });
const backend = createBackend({ location: 'localStorage' });
const trainingSet = dataset({ name: 'TrainingSet', backend });
trainingSet.capture(instances as Stream<Instance>);

const trainingSetBrowser = browser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
b.name = 'Training Launcher';
const classifier = mlp({ layers: [64, 32], epochs: 20 });
b.$click.subscribe(() => classifier.train(trainingSet));

const params = parameters(classifier);
const prog = progress(classifier);
const plotTraining = trainingPlot(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction({ name: 'mlp', backend });
const confusionMatrix = confusion(batchMLP);

const predictButton = button({ text: 'Update predictions' });
predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });

const predictionStream = input.$images
  .filter(() => tog.$checked.value)
  .map(async (img: ImageData) => classifier.predict(await featureExtractor.process(img)))
  .awaitPromises();

const plotResults = predictionPlot(predictionStream as Stream<Prediction>);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = createDashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
});

dashboard
  .page('Data Management')
  .useLeft(input, featureExtractor)
  .use([label, capture], trainingSetBrowser);
dashboard.page('Training').use(params, b, prog, plotTraining);
dashboard.page('Batch Prediction').use(predictButton, confusionMatrix);
dashboard.page('Real-time Prediction').useLeft(input).use(tog, plotResults);
dashboard.settings.useLeft(account(backend)).use(trainingSet);

dashboard.start();
