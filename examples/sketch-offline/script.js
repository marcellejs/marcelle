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
  sketchpad,
  textfield,
  toggle,
  trainingPlot,
} from '../../dist/marcelle.esm.js';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = sketchpad();
const featureExtractor = mobilenet();

const label = textfield();
label.title = 'Instance label';
const capture = button({ text: 'Capture this drawing' });
capture.title = 'Capture instances to the training set';

const instances = capture.$click
  .sample(input.$images)
  .map(async (img) => ({
    type: 'sketch',
    data: img,
    label: label.$text.value,
    thumbnail: input.$thumbnails.value,
    features: await featureExtractor.process(img),
  }))
  .awaitPromises();

const store = dataStore({ location: 'localStorage' });
const trainingSet = dataset({ name: 'TrainingSet-sketch', dataStore: store });
trainingSet.capture(instances);

const trainingSetBrowser = datasetBrowser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
const classifier = mlp({ layers: [64, 32], epochs: 20 });
b.$click.subscribe(() => classifier.train(trainingSet));

const params = parameters(classifier);
const prog = trainingProgress(classifier);
const plotTraining = trainingPlot(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction({ name: 'mlp', dataStore: store });
const confMat = confusionMatrix(batchMLP);

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
  .map(async (img) => classifier.predict(await featureExtractor.process(img)))
  .awaitPromises();

const plotResults = classificationPlot(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Sketch (Offline)',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Data Management')
  .useLeft(input, featureExtractor)
  .use([label, capture], trainingSetBrowser);
dash.page('Training').use(params, b, prog, plotTraining);
dash.page('Batch Prediction').use(predictButton, confMat);
dash.page('Real-time Prediction').useLeft(input).use(tog, plotResults);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier);

dash.start();
