/* global marcelle */

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = marcelle.imageDrop();
const classifier = marcelle.mobilenet();

// -----------------------------------------------------------
// CAPTURE TO DATASET
// -----------------------------------------------------------

const instances = source.$thumbnails.map((thumbnail) => ({
  type: 'image',
  data: source.$images.value,
  label: 'unlabeled',
  thumbnail,
}));

const backend = marcelle.createBackend({ location: 'memory' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend });

const tog = marcelle.toggle({ text: 'Capture to dataset' });
tog.$checked.skipRepeats().subscribe((x) => {
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

batchTesting.$predictions.subscribe(async () => {
  const { data } = await batchTesting.predictionService.find();
  const accuracy =
    data.map(({ label, trueLabel }) => (label === trueLabel ? 1 : 0)).reduce((x, y) => x + y, 0) /
    data.length;
  predictionAccuracy.$text.set(`Global Accuracy (Mobilenet): ${accuracy}`);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const predictionStream = source.$images.map(async (img) => classifier.predict(img)).awaitPromises();
const plotResults = marcelle.predictionPlot(predictionStream);

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

const buttonCorrect = marcelle.button({ text: 'Yes! 😛' });
buttonCorrect.name = '';
const buttonIncorrect = marcelle.button({ text: 'No... 🤔' });
buttonIncorrect.name = '';

let numCorrect = 0;
let numIncorrect = 0;
const quality = marcelle.text({ text: 'Waiting for predictions...' });
function updateQuality() {
  const percent = (100 * numCorrect) / (numCorrect + numIncorrect);
  quality.$text.set(
    `You evaluated ${percent.toFixed(0)}% of tested images as correct. ${
      percent > 50 ? '😛' : '🤔'
    }`,
  );
}
buttonCorrect.$click.subscribe(() => {
  numCorrect += 1;
  updateQuality();
});
buttonIncorrect.$click.subscribe(() => {
  numIncorrect += 1;
  updateQuality();
});

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle: Interactive Model Testing',
  author: 'Marcelle Pirates Crew',
});

const help = marcelle.text({
  text:
    'In this example, you can test an existing trained model (mobilenet), by uploading your own images to assess the quality of the predictions.',
});
help.name = 'Test Mobilenet with your images!';

dashboard
  .page('Real-time Testing')
  .useLeft(source, classifier)
  .use(
    help,
    [instanceViewer, plotResults],
    'Is this prediction Correct?',
    [buttonCorrect, buttonIncorrect],
    quality,
  );
dashboard
  .page('Batch Testing')
  .useLeft(source, classifier)
  .use(tog, trainingSetBrowser, predictButton, predictionAccuracy, confusionMatrix);
dashboard.settings.use(trainingSet);

dashboard.start();
