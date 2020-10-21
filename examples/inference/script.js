/* global marcelle, mostCore */

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = marcelle.imageDrop();
const classifier = marcelle.dnn();

// -----------------------------------------------------------
// CAPTURE TO DATASET
// -----------------------------------------------------------

const instances = source.$thumbnails.thru(
  mostCore.map((thumbnail) => ({
    type: 'image',
    data: source.$images.value,
    label: 'unlabeled',
    thumbnail,
  })),
);

const backend = marcelle.createBackend({ location: 'memory' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend });

const tog = marcelle.toggle({ text: 'Capture to dataset' });
tog.$checked.thru(mostCore.skipRepeats).subscribe((x) => {
  if (x) {
    trainingSet.capture(instances);
  } else {
    trainingSet.capture(null);
  }
});

const trainingSetBrowser = marcelle.browser(trainingSet);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchTesting = marcelle.batchPrediction({ name: 'mobilenet', backend });
const predictButton = marcelle.button({ text: 'Update predictions' });
const predictionAccuracy = marcelle.text({ text: 'Waiting for predictions...' });
const confusionMatrix = marcelle.confusion(batchTesting);
confusionMatrix.name = 'Mobilenet: Confusion Matrix';

predictButton.$click.subscribe(async () => {
  await batchTesting.clear();
  await batchTesting.predict(classifier, trainingSet, 'data');
});


// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const predictionStream = marcelle.createStream(
  mostCore.awaitPromises(mostCore.map(async (img) => classifier.predict(img), source.$images)),
);
const plotResults = marcelle.predictionPlotter(predictionStream);

const instanceViewer = {
  id: 'my-instance-viewer',
  mount(targetSelector) {
    const target = document.querySelector(targetSelector || '#my-instance-viewer');
    const instanceCanvas = document.createElement('canvas');
    instanceCanvas.classList.add('w-full', 'max-w-full');
    const instanceCtx = instanceCanvas.getContext('2d');
    target.appendChild(instanceCanvas);
    const unSub = source.$images.subscribe((img) => {
      instanceCanvas.width = img.width;
      instanceCanvas.height = img.height;
      instanceCtx.putImageData(img, 0, 0);
    });
    this.destroy = () => {
      target.removeChild(instanceCanvas);
      unSub();
    };
  },
};

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle: Interactive Model Testing',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

const help = marcelle.text({
  text:
    'In this example, you can upload a pre-trained classification model (converted from a Keras model, see examples here: https://keras.io/api/applications/) and perform inference with input images of your choice.',
});
help.name = 'Test generic DNN classifier';

dashboard
  .page('Real-time Testing')
  .useLeft(source)
  .use(
    help,
    classifier,
    [instanceViewer, plotResults],
  );
dashboard
  .page('Batch Testing')
  .useLeft(source, classifier)
  .use(tog, trainingSetBrowser, predictButton, predictionAccuracy, confusionMatrix);
dashboard.start();