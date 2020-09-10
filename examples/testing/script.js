/* eslint-disable no-undef */

// -----------------------------------------------------------
// INPUT PIPELINE & CLASSIFICATION
// -----------------------------------------------------------

const source = imageDrop();
const classifier = mobilenet();

// -----------------------------------------------------------
// CAPTURE TO DATASET
// -----------------------------------------------------------

const instances = createStream(
  snapshot(
    (img, thumb) => ({ data: img, label: 'unlabeled', thumbnail: thumb }),
    source.$images,
    source.$thumbnails,
  ),
);

const backend = createBackend({ location: 'memory' });
const trainingSet = dataset({ name: 'TrainingSet', backend });

const tog = toggle({ text: 'Capture to dataset' });
createStream(skipRepeats(tog.$checked)).subscribe((x) => {
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

const batchTesting = batchPrediction({ name: 'mobilenet', backend });
const predictButton = button({ text: 'Update predictions' });
const predictionAccuracy = text({ text: 'Waiting for predictions...' });
const confusionMatrix = confusion(batchTesting);
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

const results = text({ text: 'Drop an image to evaluate the model...' });

createStream(awaitPromises(map(async (img) => classifier.predict(img), source.$images))).subscribe(
  (y) => {
    results.$text.set(
      `<h2>predicted label: ${y.label}</h2><p>Confidences: ${Object.values(y.confidences).map((z) =>
        z.toFixed(2),
      )}</p>`,
    );
  },
);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = createDashboard({
  title: 'Marcelle: Interactive Model Testing',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard.page('Real-time Testing').useLeft(source, classifier).use(results);
dashboard
  .page('Batch Testing')
  .useLeft(source, classifier)
  .use(tog, trainingSetBrowser, predictButton, predictionAccuracy, confusionMatrix);
dashboard.start();
