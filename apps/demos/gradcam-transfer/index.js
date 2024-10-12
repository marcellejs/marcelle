import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/gui-widgets/dist/marcelle-gui-widgets.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import {
  confidencePlot,
  webcam,
  dataStore,
  dataset,
  datasetBrowser,
  trainingPlot,
  imageDisplay,
} from '@marcellejs/core';
import {
  button,
  modelParameters,
  select,
  text,
  textInput,
  trainingProgress,
} from '@marcellejs/gui-widgets';
import { dashboard } from '@marcellejs/layouts';
import { gradcam, imageClassifier } from './components';
import { combineLatest, filter, from, map, mergeMap, mergeWith, throttleTime, zip } from 'rxjs';

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

const $instances = zip(input.$images, input.$thumbnails).pipe(
  filter(() => capture.$pressed.getValue()),
  map(([x, thumbnail]) => ({
    x,
    y: label.$value.getValue(),
    thumbnail,
  })),
);

$instances.subscribe(trainingSet.create);

// -----------------------------------------------------------
// MODEL & TRAINING
// -----------------------------------------------------------

const b = button('Train');
b.title = 'Training Launcher';

const classifier = imageClassifier({ layers: [10] }).sync(store, 'custom-classifier');

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
    selectClass.$options.next(classifier.labels);
  }
});

const wc = webcam();

const $images = trainingSetBrowser.$selected.pipe(
  filter((sel) => sel.length === 1),
  mergeMap(([id]) => from(trainingSet.get(id))),
  map(({ x }) => x),
  mergeWith(wc.$images.pipe(throttleTime(500))),
);

const $predictions = $images.pipe(
  map(classifier.predict),
  mergeMap((x) => from(x)),
);

$predictions.subscribe(({ label }) => {
  selectClass.$value.next(label);
});

const plotResults = confidencePlot($predictions);

const gcDisplay = [
  imageDisplay($images),
  imageDisplay(
    combineLatest([$images, selectClass.$value]).pipe(
      mergeMap(([img, className]) => from(gc.explain(img, classifier.labels.indexOf(className)))),
    ),
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
