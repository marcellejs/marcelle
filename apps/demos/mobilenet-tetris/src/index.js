import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/gui-widgets/dist/marcelle-gui-widgets.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import './style.css';
import {
  datasetBrowser,
  dataset,
  trainingProgress,
  dataStore,
  batchPrediction,
  confusionMatrix,
  confidencePlot,
  mobileNet,
  webcam,
  knnClassifier,
} from '@marcellejs/core';
import { button, modelParameters, select, textInput, toggle } from '@marcellejs/gui-widgets';
import { dashboard } from '@marcellejs/layouts';
import { setMove, reset, stop } from './tetris';
import App from './App.svelte';
import { mount } from "svelte";

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
const trainingSet = dataset('training-set-mobilenet-tetris', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

let recording = false;
input.$images
  .filter(() => capture.$pressed.get() || recording)
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    thumbnail: input.$thumbnails.get(),
    y: label.$value.get(),
  }))
  .awaitPromises()
  .subscribe(trainingSet.create);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const trainingLauncher = button('Train');
trainingLauncher.title = 'Training Launcher';
const classifier = knnClassifier().sync(store, 'mobilenet-tetris-classifier');
trainingLauncher.$click.subscribe(() => classifier.train(trainingSet));

const params = modelParameters(classifier);
const prog = trainingProgress(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction('mlp', store);
const confMat = confusionMatrix(batchMLP);

const predictButton = button('Update predictions');
predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle('toggle prediction');

const predictionStream = input.$images
  .filter(() => tog.$checked.get())
  .map(async (img) => classifier.predict(await featureExtractor.process(img)))
  .awaitPromises();

// const predictedLabel = predictionStream.throttle(200).map((x) => x.label);
const predictedLabel = predictionStream.map((x) => x.label).skipRepeats();
predictedLabel.subscribe((x) => {
  setMove(x);
});

const plotResults = confidencePlot(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
});

dash.page('Data Management').sidebar(input).use([label, capture], trainingSetBrowser);
dash.page('Training').use(params, trainingLauncher, prog);
dash.page('Batch Prediction').use(predictButton, confMat);
dash.page('Real-time Prediction').sidebar(input).use(tog, plotResults);
dash.settings.use(trainingSet);

let playing = false;
const playButton = document.querySelector('#play');
playButton.addEventListener('click', () => {
  playButton.classList.toggle('danger');
  if (playing) {
    tog.$checked.set(false);
    playButton.innerHTML = 'Play!';
    stop();
  } else {
    playButton.innerHTML = 'Stop!';
    tog.$checked.set(true);
    reset();
  }
  playing = !playing;
});

const sel = select({
  options: [
    'idle',
    'left',
    'right',
    'soft-drop',
    'hard-drop',
    'rotate-clockwise',
    'rotate-counterclockwise ',
  ],
});
sel.$value.subscribe((x) => label.$value.set(x));

const app = mount(App, {
  target: document.querySelector('#tetris-controls'),
  props: {
    input,
    sel,
    browser: trainingSetBrowser,
    predictedLabel,
  },
});

app.$on('clearDataset', () => {
  trainingSet.clear();
});

app.$on('recording', (value) => {
  recording = value.detail;
  if (!value.detail) {
    classifier.train(trainingSet);
  }
});
