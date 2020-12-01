/* eslint-disable import/extensions */
import {
  cocoSsd,
  dashboard,
  imageDrop,
  predictionPlot,
  toggle,
  visObjectDetection,
  webcam,
} from '../../dist/marcelle.bundle.esm.js';

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = imageDrop();
const cocoClassifier = cocoSsd();

// -----------------------------------------------------------
// SINGLE IMAGE PREDICTION
// -----------------------------------------------------------

const cocoPredictionStream = source.$images
  .map(async (img) => cocoClassifier.predict(img))
  .awaitPromises();

const cocoBetterPredictions = cocoPredictionStream.map(({ outputs }) => ({
  label: outputs[0].class,
  confidences: outputs.reduce((x, y) => ({ ...x, [y.class]: y.confidence }), {}),
}));

const objDetectionVis = visObjectDetection(source.$images, cocoPredictionStream);
const cocoPlotResults = predictionPlot(cocoBetterPredictions);

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const wc = webcam();
const tog = toggle({ text: 'toggle prediction' });

const rtDetectStream = wc.$images
  .filter(() => tog.$checked.value)
  .map(async (img) => cocoClassifier.predict(img))
  .awaitPromises();
const realtimePredictions = rtDetectStream.map(({ outputs }) => ({
  label: outputs[0].class,
  confidences: outputs.reduce((x, y) => ({ ...x, [y.class]: y.confidence }), {}),
}));

const imgStream = wc.$images.filter(() => tog.$checked.value);

const rtObjDetectionVis = visObjectDetection(imgStream, rtDetectStream);
const rtPlotResults = predictionPlot(realtimePredictions);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle: Object Detection with COCO-SSD',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Image-based Detection')
  .useLeft(source, cocoClassifier)
  .use([objDetectionVis, cocoPlotResults]);

dash
  .page('Video-based Detection')
  .useLeft(wc, cocoClassifier)
  .use(tog)
  .use([rtObjDetectionVis, rtPlotResults]);

dash.start();
