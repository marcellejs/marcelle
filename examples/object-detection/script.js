/* global marcelle */

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = marcelle.imageDrop();
const cocoClassifier = marcelle.cocoSsd();

// -----------------------------------------------------------
// COCO REAL-TIME PREDICTION
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
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle: Object Detection with COCO-SSD',
  author: 'Marcelle Pirates Crew',
});

dashboard
  .page('Object Detection')
  .useLeft(source, cocoClassifier)
  .use([objDetectionVis, cocoPlotResults]);

dashboard.start();
