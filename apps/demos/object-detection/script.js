import '@marcellejs/core/dist/marcelle.css';
import {
  cocoSsd,
  dashboard,
  imageUpload,
  confidencePlot,
  toggle,
  detectionBoxes,
  webcam,
  notification,
} from '@marcellejs/core';
import { filter, from, interval, map, mergeMap, sample } from 'rxjs';

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = imageUpload();
const cocoClassifier = cocoSsd();

// -----------------------------------------------------------
// SINGLE IMAGE PREDICTION
// -----------------------------------------------------------

const $cocoPredictions = source.$images.pipe(
  map(cocoClassifier.predict),
  mergeMap((x) => from(x)),
);

$cocoPredictions.pipe(filter(({ outputs }) => outputs.length === 0)).subscribe(() => {
  notification({ title: 'No object detected', message: 'try with another image' });
});

const cocoBetterPredictions = $cocoPredictions.pipe(
  filter(({ outputs }) => outputs.length > 0),
  map(({ outputs }) => ({
    label: outputs[0].class,
    confidences: outputs.reduce((x, y) => ({ ...x, [y.class]: y.confidence }), {}),
  })),
);

const objDetectionVis = detectionBoxes(source.$images, $cocoPredictions);
const cocoPlotResults = confidencePlot(cocoBetterPredictions);

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const wc = webcam();
const $images = wc.$images.pipe(sample(interval(500)));

const $realTimeDetections = $images.pipe(
  map(async (img) => cocoClassifier.predict(img)),
  mergeMap((x) => from(x)),
);

const realtimePredictions = $realTimeDetections.pipe(
  filter(({ outputs }) => outputs.length > 0),
  map(({ outputs }) => ({
    label: outputs[0].class,
    confidences: outputs.reduce((x, y) => ({ ...x, [y.class]: y.confidence }), {}),
  })),
);

const rtObjDetectionVis = detectionBoxes($images, $realTimeDetections);
const rtPlotResults = confidencePlot(realtimePredictions);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle: Object Detection with COCO-SSD',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Image-based Detection')
  .sidebar(source, cocoClassifier)
  .use([objDetectionVis, cocoPlotResults]);

dash
  .page('Video-based Detection')
  .sidebar(wc, cocoClassifier)
  .use([rtObjDetectionVis, rtPlotResults]);

dash.show();
