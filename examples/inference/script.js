/* eslint-disable import/extensions */
import {
  batchPrediction,
  browser,
  button,
  confusion,
  dashboard,
  dataset,
  dataStore,
  imageDrop,
  predictionPlot,
  text,
  tfImageClassifier,
  toggle,
} from '../../dist/marcelle.bundle.esm.js';

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = imageDrop();
const classifier = tfImageClassifier().sync(dataStore({ location: 'localStorage' }));

// -----------------------------------------------------------
// CAPTURE TO DATASET
// -----------------------------------------------------------

const instances = source.$thumbnails.map((thumbnail) => ({
  type: 'image',
  data: source.$images.value,
  label: 'unlabeled',
  thumbnail,
}));

const store = dataStore({ location: 'memory' });
const trainingSet = dataset({ name: 'TrainingSet', dataStore: store });

const tog = toggle({ text: 'Capture to dataset' });
tog.$checked.skipRepeats().subscribe((x) => {
  if (x) {
    trainingSet.capture(instances);
  } else {
    trainingSet.capture(null);
  }
});

const trainingSetBrowser = browser(trainingSet);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchTesting = batchPrediction({ name: 'mobilenet', dataStore: store });
const predictButton = button({ text: 'Update predictions' });
const predictionAccuracy = text({ text: 'Waiting for predictions...' });
const confusionMatrix = confusion(batchTesting);
confusionMatrix.name = 'Mobilenet: Confusion Matrix';

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

const plotResults = predictionPlot(betterPredictions);

const instanceViewer = {
  id: 'my-instance-viewer',
  mount(target) {
    const t = target || document.querySelector('#my-instance-viewer');
    const instanceCanvas = document.createElement('canvas');
    instanceCanvas.classList.add('w-full', 'max-w-full');
    const instanceCtx = instanceCanvas.getContext('2d');
    t.appendChild(instanceCanvas);
    const unSub = source.$images.subscribe((img) => {
      instanceCanvas.width = img.width;
      instanceCanvas.height = img.height;
      instanceCtx.putImageData(img, 0, 0);
    });
    this.destroy = () => {
      t.removeChild(instanceCanvas);
      unSub();
    };
  },
};

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle: Interactive Model Testing',
  author: 'Marcelle Pirates Crew',
});

const help = text({
  text:
    'In this example, you can upload a pre-trained classification model (converted from a Keras model, see examples here: https://keras.io/api/applications/) and perform inference with input images of your choice.',
});
help.name = 'Test generic DNN classifier';

dash.page('Real-time Testing').useLeft(source).use(help, classifier, [instanceViewer, plotResults]);
dash
  .page('Batch Testing')
  .useLeft(source, classifier)
  .use(tog, trainingSetBrowser, predictButton, predictionAccuracy, confusionMatrix);
dash.settings.use(trainingSet);

dash.start();
