/* global marcelle */

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = marcelle.imageDrop();
const cocoClassifier = marcelle.cocoSsd();

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

const objDetectionVis = marcelle.visObjectDetection(source.$images, cocoPredictionStream);
const cocoPlotResults = marcelle.predictionPlot(cocoBetterPredictions);

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const wc = marcelle.webcam();
const tog = marcelle.toggle({ text: 'toggle prediction' });

const rtDetectStream = wc.$images
  .filter(() => tog.$checked.value)
  .map(async (img) => cocoClassifier.predict(img))
  .awaitPromises();
const realtimePredictions = rtDetectStream.map(({ outputs }) => ({
  label: outputs[0].class,
  confidences: outputs.reduce((x, y) => ({ ...x, [y.class]: y.confidence }), {}),
}));

const imgStream = wc.$images.filter(() => tog.$checked.value);

const rtObjDetectionVis = marcelle.visObjectDetection(imgStream, rtDetectStream);
const rtPlotResults = marcelle.predictionPlot(realtimePredictions);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle: Object Detection with COCO-SSD',
  author: 'Marcelle Pirates Crew',
});

dashboard
  .page('Image-based Detection')
  .useLeft(source, cocoClassifier)
  .use([objDetectionVis, cocoPlotResults]);

dashboard
  .page('Video-based Detection')
  .useLeft(wc, cocoClassifier)
  .use(tog)
  .use([rtObjDetectionVis, rtPlotResults]);

dashboard.start();
