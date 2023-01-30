import '@marcellejs/core/dist/marcelle.css';
import {
  button,
  dashboard,
  dataset,
  datasetBrowser,
  dataStore,
  deviceMotion,
  genericChart,
  Stream,
  textInput,
} from '@marcellejs/core';
import thumbnail from './line-chart.png';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = deviceMotion();
// const accViz = genericChart({ preset: 'bar-fast' });
// accViz.addSeries(
//   input.$accelerationIncludingGravity.map(({ x, y, z }) => [x, y, z]),
//   'Acceleration',
// );

const label = textInput();
label.title = 'Instance label';
const capture = button('Hold to record instances');
capture.title = 'Capture instances to the training set';

// function recordFrames(values, recorder) {
//   const result = Stream.never();
//   let buffer = [];
//   let unSub = () => {};
//   recorder.subscribe((r) => {
//     if (r) {
//       buffer = [];
//       unSub = values.subscribe((v) => {
//         buffer.push(v);
//       });
//     } else {
//       unSub();
//       result.set(buffer.slice());
//     }
//   });
//   return result;
// }
// const $frames = recordFrames(input.$accelerationIncludingGravity, capture.$pressed);

const $inp = Stream.periodic(10).map(() => Array.from(Array(3), () => Math.random()));
// const $inp = input.$accelerationIncludingGravity;

const $start = capture.$pressed.filter((x) => !!x);
const $stop = capture.$pressed.filter((x) => !x);
const $windows = $start.map(() => $inp.until($stop).scan((a, x) => a.concat([x]), []));

const viz = genericChart({ preset: 'line-fast' });
const $recording = $windows.switchLatest().throttle(50);
viz.addSeries(
  $recording.map((v) => v.map((w) => w[0])),
  'x (Current Recording)',
);
viz.addSeries(
  $recording.map((v) => v.map((w) => w[1])),
  'y (Current Recording)',
);
viz.addSeries(
  $recording.map((v) => v.map((w) => w[2])),
  'z (Current Recording)',
);

const $frames = $windows.map((stream) => $stop.sample(stream)).switchLatest();

// const t = text('...');
// $inp.map((v) => v.x).subscribe((x) => t.$value.set(x));

const store = dataStore('localStorage');
const trainingSet = dataset('training-set-dashboard', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

$frames.map((x) => ({ x, y: label.$value.get(), thumbnail })).subscribe(trainingSet.create);

const dash = dashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
});

dash.page('Data Management').sidebar(input).use([label, capture], viz, trainingSetBrowser);

dash.show();
