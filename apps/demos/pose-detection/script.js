import '@marcellejs/core/dist/marcelle.css';
import '@marcellejs/gui-widgets/dist/marcelle-gui-widgets.css';
import '@marcellejs/layouts/dist/marcelle-layouts.css';
import {
  batchPrediction,
  datasetBrowser,
  confusionMatrix,
  dataset,
  dataStore,
  mlpClassifier,
  confidencePlot,
  trainingPlot,
  poseDetection,
  throwError,
  webcam,
  imageDisplay,
} from '@marcellejs/core';
import {
  button,
  modelParameters,
  text,
  textInput,
  toggle,
  trainingProgress,
} from '@marcellejs/gui-widgets';
import { dashboard } from '@marcellejs/layouts';
import { $joints, selectPreset, skeletonImage } from './configuration';
import {
  EMPTY,
  concatMap,
  distinctUntilChanged,
  filter,
  from,
  interval,
  map,
  mergeMap,
  switchMap,
  zip,
} from 'rxjs';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = poseDetection('MoveNet', { runtime: 'tfjs' });

console.log('$joints', $joints);
console.log('$joints.getValue()', $joints.getValue());
const postprocess = (poses) => featureExtractor.postprocess(poses, $joints.getValue());

const showSkeleton = toggle('Visualize Skeleton');
showSkeleton.title = '';

const poseViz2 = imageDisplay(
  showSkeleton.$checked.pipe(
    switchMap((v) => (v ? input.$images : EMPTY)),
    map(async (img) => {
      const result = await featureExtractor.predict(img);
      return featureExtractor.render(img, result);
    }),
    mergeMap((x) => from(x)),
  ),
);

const label = textInput();
label.title = 'Instance label';
const capture = button('Start Recording');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('training-set-poses', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

const $ctl = capture.$click.pipe(
  concatMap(() => zip(interval(1000), from(['3', '2', '1', 'start', 'start', 'start', 'stop']))),
  map((x) => x[1]),
);
$ctl.subscribe(console.log);
const counter = text();
counter.title = 'Recording Status';
$ctl.subscribe((x) => counter.$value.next(`<span style="font-size: 32px">${x}</span>`));

const $instances = $ctl.pipe(
  filter((x) => ['start', 'stop'].includes(x)),
  distinctUntilChanged(),
  switchMap((x) => (x === 'start' ? input.$images : EMPTY)),
  map(async (img) => {
    const result = await featureExtractor.predict(img);
    const thumbnail = featureExtractor.thumbnail(img, result);
    return {
      x: result,
      y: label.$value.getValue(),
      raw_image: img,
      thumbnail,
    };
  }),
  mergeMap((x) => from(x)),
);

$instances.subscribe(trainingSet.create);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button('Train');
b.title = 'Training Launcher';
const classifier = mlpClassifier().sync(store, 'mlp-dashboard');
// const classifier = mlpClassifier({ layers: [32, 8], epochs: 100 }).sync(store, 'mlp-dashboard');

b.$click.subscribe(() =>
  classifier.train(trainingSet.items().map(({ x, y }) => ({ x: postprocess(x), y }))),
);

const params = modelParameters(classifier);
const prog = trainingProgress(classifier);
const plotTraining = trainingPlot(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction('mlp', store);
const confMat = confusionMatrix(batchMLP);

const predictButton = button('Update predictions');
predictButton.$click.subscribe(async () => {
  if (!classifier.ready) {
    throwError(new Error('No classifier has been trained'));
  }
  await batchMLP.clear();
  await batchMLP.predict(
    classifier,
    trainingSet.items().map(({ x, y }) => ({ x: postprocess(x), y })),
  );
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle('toggle prediction');
tog.$checked.subscribe((checked) => {
  if (checked && !classifier.ready) {
    throwError(new Error('No classifier has been trained'));
    setTimeout(() => {
      tog.$checked.next(false);
    }, 500);
  }
});

const $predictions = input.$images.pipe(
  filter(() => tog.$checked.getValue() && classifier.ready),
  map(featureExtractor.predict),
  mergeMap((x) => from(x)),
  filter((x) => x.length > 0),
  map(postprocess),
  map(classifier.predict),
  mergeMap((x) => from(x)),
);

const plotResults = confidencePlot($predictions);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Data Management')
  .sidebar(input, featureExtractor, showSkeleton, poseViz2)
  .use([label, capture, counter], trainingSetBrowser);
dash.page('Training').use(params, b, prog, plotTraining);
dash.page('Batch Prediction').use(predictButton, confMat);
dash.page('Real-time Prediction').sidebar(input, poseViz2).use(tog, plotResults);
dash.settings
  .dataStores(store)
  .datasets(trainingSet)
  .models(classifier)
  .predictions(batchMLP)
  .use('MoveNet Configuration', selectPreset, skeletonImage);

dash.show();
