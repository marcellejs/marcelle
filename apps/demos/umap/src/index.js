import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import {
  datasetBrowser,
  webcam,
  mobileNet,
  dataset,
  button,
  dataStore,
  textInput,
} from '@marcellejs/core';
import { umap } from './components';
import { filter, from, map, mergeMap, zip } from 'rxjs';
import { dashboard } from '@marcellejs/layouts';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobileNet();

const label = textInput();
label.title = 'Instance label';
const capture = button('Hold to record instances');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('training-set-umap', store);
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
// UMAP
// -----------------------------------------------------------

const trainingSetUMap = umap(trainingSet);

const updateUMap = button('Update Visualization');
updateUMap.$click.subscribe(() => {
  trainingSetUMap.render();
});

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Custom UMAP Module',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Main')
  .sidebar(input, featureExtractor)
  .use([label, capture], trainingSetBrowser, updateUMap, trainingSetUMap);
dash.settings.use(trainingSet);

dash.show();
