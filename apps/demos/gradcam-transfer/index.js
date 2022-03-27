import '@marcellejs/core/dist/marcelle.css';
import {
  dashboard,
  confidencePlot,
  webcam,
  textInput,
  button,
  dataStore,
  dataset,
  datasetBrowser,
  modelParameters,
  trainingProgress,
  trainingPlot,
  select,
  imageDisplay,
  text,
} from '@marcellejs/core';
import { gradcam, imageClassifier } from './components';

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const input = webcam();

const label = textInput();
label.title = 'Instance label';
const capture = button('Hold to record instances');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('training-set-dashboard', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

input.$images
  .filter(() => capture.$pressed.value)
  .map((x) => ({ x, y: label.$value.value, thumbnail: input.$thumbnails.value }))
  .subscribe(trainingSet.create.bind(trainingSet));

// -----------------------------------------------------------
// MODEL & TRAINING
// -----------------------------------------------------------

const b = button('Train');
b.title = 'Training Launcher';

const classifier = imageClassifier({ layers: [10], dataStore: store }).sync('custom-classifier');

b.$click.subscribe(() => classifier.train(trainingSet));

const params = modelParameters(classifier);
const prog = trainingProgress(classifier);
const plotTraining = trainingPlot(classifier);

// -----------------------------------------------------------
// SINGLE IMAGE PREDICTION
// -----------------------------------------------------------

const gc = gradcam();

classifier.$training.subscribe(({ status }) => {
  if (['loaded', 'success'].includes(status)) {
    gc.setModel(classifier.model);
    gc.selectLayer();
  }
});

const hint = text('Select an image in the dataset browser to inspect predictions and Grad-CAM');
hint.title = 'Hint';
const selectClass = select([]);
selectClass.title = 'Select the class to inspect';
classifier.$training.subscribe(({ status }) => {
  if (['success', 'loaded'].includes(status)) {
    selectClass.$options.set(classifier.labels);
  }
});

const wc = webcam();

const $instances = trainingSetBrowser.$selected
  .filter((sel) => sel.length === 1)
  .map(([id]) => trainingSet.get(id))
  .awaitPromises()
  .map(({ x }) => x)
  .merge(wc.$images.throttle(500));

const $predictions = $instances.map(async (img) => classifier.predict(img)).awaitPromises();

$predictions.subscribe(({ label }) => {
  selectClass.$value.set(label);
});

const plotResults = confidencePlot($predictions);

const gcDisplay = [
  imageDisplay($instances),
  imageDisplay(
    $instances
      .combine((className, img) => [img, className], selectClass.$value)
      .map(([img, className]) => gc.explain(img, classifier.labels.indexOf(className)))
      .awaitPromises(),
  ),
];

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle: Grad-CAM Example',
  author: 'Marcelle Pirates Crew',
});

dash.page('Data Management').sidebar(input).use([label, capture], trainingSetBrowser);
dash.page('Training').use(params, b, prog, plotTraining);
dash
  .page('Inspect Predictions')
  .sidebar(hint, wc)
  .use(trainingSetBrowser, selectClass, gcDisplay, plotResults);

dash.show();
