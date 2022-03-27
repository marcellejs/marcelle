import '@marcellejs/core/dist/marcelle.css';
import {
  datasetBrowser,
  webcam,
  mobileNet,
  dataset,
  button,
  dataStore,
  dashboard,
  textInput,
} from '@marcellejs/core';
import { umap } from './components';

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

input.$images
  .filter(() => capture.$pressed.value)
  .map(async (x) => ({
    x: await featureExtractor.process(x),
    y: label.$value.value,
    thumbnail: input.$thumbnails.value,
  }))
  .awaitPromises()
  .subscribe(trainingSet.create.bind(trainingSet));

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
