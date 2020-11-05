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

const cocoPlotResults = marcelle.predictionPlot(cocoBetterPredictions);

const objDetectionPlot = marcelle.visObjectDetection(source.$images, cocoPredictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle: Interactive Model Testing',
  author: 'Marcelle Pirates Crew',
});

dashboard.page('Real-time Testing').useLeft(source).use([objDetectionPlot, cocoPlotResults]);
dashboard.start();

// eslint-disable-next-line no-undef
imageStream.subscribe((img) => display(img));
