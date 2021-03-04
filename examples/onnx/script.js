/* eslint-disable import/extensions */
import '../../dist/marcelle.css';
import {
  batchPrediction,
  datasetBrowser,
  button,
  confusionMatrix,
  dashboard,
  dataset,
  dataStore,
  fileUpload,
  imageUpload,
  classificationPlot,
  text,
  onnxImageClassifier,
  toggle,
} from '../../dist/marcelle.esm.js';

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = imageUpload({ width: 224, height: 224 });

const up = fileUpload();
up.title = 'Upload model files (.json and .bin)';
const classifier = onnxImageClassifier({ applySoftmax: true, topK: 5 });

fetch('./imagenet_class_index.json')
  .then((res) => res.json())
  .then((res) => {
    classifier.labels = Object.values(res).map((x) => x[1]);
  });

// classifier.loadFromUrl('/examples/onnx/resnet50v2.onnx');
up.$files.subscribe((fl) => {
  classifier.loadFromFiles(fl);
});

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
const trainingSet = dataset({ name: 'TrainingSet-onnx', dataStore: store });

const tog = toggle({ text: 'Capture to dataset' });
tog.$checked.skipRepeats().subscribe((x) => {
  if (x) {
    trainingSet.capture(instances);
  } else {
    trainingSet.capture(null);
  }
});

const trainingSetBrowser = datasetBrowser(trainingSet);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchTesting = batchPrediction({ name: 'mobilenet', dataStore: store });
const predictButton = button({ text: 'Update predictions' });
const predictionAccuracy = text({ text: 'Waiting for predictions...' });
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
const plotResults = classificationPlot(predictionStream);

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
  destroy() {},
};

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle: ONNX Inference Example',
  author: 'Marcelle Pirates Crew',
});

const help = text({
  text:
    "In this example, you can upload a pre-trained image classification model in ONNX format and perform inference with input images of your choice. Models are available on ONNX's model zoo: https://github.com/onnx/models#image_classification.",
});
help.title = 'Test generic DNN classifier';

dash
  .page('Real-time Testing')
  .useLeft(up, classifier)
  .use(help, source, [instanceViewer, plotResults]);
dash
  .page('Batch Testing')
  .useLeft(source, classifier)
  .use(tog, trainingSetBrowser, predictButton, predictionAccuracy, confMat);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier);

dash.start();
