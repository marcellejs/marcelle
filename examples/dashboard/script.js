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
  throwError,
} from '../../dist/marcelle.esm';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
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

const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet-dashboard', store);
trainingSet.capture(instances);

const trainingSetBrowser = datasetBrowser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
b.title = 'Training Launcher';
const classifier = mlp({ layers: [64, 32], epochs: 20, dataStore: store }).sync('mlp-dashboard');
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
  if (!classifier.ready) {
    throwError(new Error('No classifier has been trained'));
  }
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });
tog.$checked.subscribe((checked) => {
  if (checked && !classifier.ready) {
    throwError(new Error('No classifier has been trained'));
    setTimeout(() => {
      tog.$checked.set(false);
    }, 500);
  }
});

const predictionStream = input.$images
  .filter(() => tog.$checked.value && classifier.ready)
  .map(async (img) => classifier.predict(await featureExtractor.process(img)))
  .awaitPromises();

const plotResults = classificationPlot(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Data Management')
  .useLeft(input, featureExtractor)
  .use([label, capture], trainingSetBrowser);
dash.page('Training').use(params, b, prog, plotTraining);
dash.page('Batch Prediction').use(predictButton, confMat);
dash.page('Real-time Prediction').useLeft(input).use(tog, plotResults);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier).predictions(batchMLP);

dash.start();
