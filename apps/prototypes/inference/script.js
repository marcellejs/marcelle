import '@marcellejs/core/dist/marcelle.css';
import {
  batchPrediction,
  datasetBrowser,
  button,
  confusionMatrix,
  dashboard,
  dataset,
  dataStore,
  fileUpload,
  imageDisplay,
  imageUpload,
  confidencePlot,
  text,
  tfjsModel,
  toggle,
} from '@marcellejs/core';

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = imageUpload();

const up = fileUpload();
up.title = 'Upload model files (.json and .bin)';
const classifier = tfjsModel({
  inputType: 'image',
  taskType: 'classification',
}).sync(dataStore('localStorage'), 'inference-example-classifier');
up.$files.subscribe((fl) => {
  classifier.loadFromFiles(fl);
});

// -----------------------------------------------------------
// CAPTURE TO DATASET
// -----------------------------------------------------------

const $instances = source.$thumbnails.map((thumbnail) => ({
  x: source.$images.get(),
  y: 'unlabeled',
  thumbnail,
}));

const store = dataStore('memory');
const trainingSet = dataset('TrainingSet-inference', store);

const tog = toggle('Capture to dataset');
// eslint-disable-next-line @typescript-eslint/no-empty-function
let unSub = () => {};
tog.$checked.skipRepeats().subscribe((x) => {
  unSub();
  unSub = $instances.subscribe(trainingSet.create);
});

const trainingSetBrowser = datasetBrowser(trainingSet);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchTesting = batchPrediction('mobileNet', store);
const predictButton = button('Update predictions');
const predictionAccuracy = text('Waiting for predictions...');
const confMat = confusionMatrix(batchTesting);
confMat.title = 'Mobilenet: Confusion Matrix';

predictButton.$click.subscribe(async () => {
  await batchTesting.clear();
  await batchTesting.predict(classifier, trainingSet, 'data');
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const predictionStream = source.$images.map(async (img) => classifier.predict(img)).awaitPromises();

let labels;
fetch('./imagenet_class_index.json')
  .then((res) => res.json())
  .then((res) => {
    labels = Object.values(res).map((x) => x[1]);
  });

const betterPredictions = predictionStream.map(({ label, confidences }) => {
  const conf = Object.entries(confidences)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  return {
    label: labels[parseInt(label, 10)],
    confidences: conf.reduce((x, y) => ({ ...x, [labels[y[0]]]: y[1] }), {}),
  };
});

const plotResults = confidencePlot(betterPredictions);

const instanceViewer = imageDisplay(source.$images);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle: Interactive Model Testing',
  author: 'Marcelle Pirates Crew',
});

const help = text(
  `In this example, you can upload a pre-trained classification model (converted from a Keras model, see examples here: https://keras.io/api/applications/) and perform inference with input images of your choice.`,
);
help.title = 'Test generic DNN classifier';

dash
  .page('Real-time Testing')
  .sidebar(up, classifier)
  .use([source, help], [instanceViewer, plotResults]);
dash
  .page('Batch Testing')
  .sidebar(source, classifier)
  .use(tog, trainingSetBrowser, predictButton, predictionAccuracy, confMat);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier);

dash.show();
