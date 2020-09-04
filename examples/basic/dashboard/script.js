/* eslint-disable no-undef */

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const w = webcam();
const m = mobilenet();

const cap = capture({ input: w.$images, thumbnail: w.$thumbnails });
const instances = new Stream(
  awaitPromises(
    map(
      async (instance) => ({
        ...instance,
        type: 'image',
        features: await m.process(instance.data),
      }),
      cap.$instances,
    ),
  ),
);

const backend = createBackend({ location: 'localStorage' });
const trainingSet = dataset({ name: 'TrainingSet', backend });
trainingSet.capture(instances);

const trainingSetBrowser = browser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
const classifier = mlp({ layers: [128, 64], epochs: 30 });
b.$click.subscribe(() => classifier.train(trainingSet));

const params = parameters(classifier);
const prog = progress(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction({ name: 'mlp', backend });
const predictButton = button({ text: 'Update predictions' });
const predictionAccuracy = text({ text: 'Waiting for predictions...' });
const confusionMatrix = confusion(batchMLP);

predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

batchMLP.$predictions.subscribe(async () => {
  const { data: predictions } = await batchMLP.predictionService.find();
  const accuracy =
    predictions
      .map(({ label, trueLabel }) => (label === trueLabel ? 1 : 0))
      .reduce((x, y) => x + y, 0) / predictions.length;
  predictionAccuracy.$text.set(`Global Accuracy: ${accuracy}`);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });
const results = text({ text: 'waiting for predictions...' });

let predictions = { stop() {} };
createStream(skipRepeats(tog.$checked)).subscribe((x) => {
  if (x) {
    predictions = createStream(
      awaitPromises(map(async (img) => classifier.predict(await m.process(img)), w.$images)),
    );
    predictions.subscribe((y) => {
      results.$text.set(
        `<h2>predicted label: ${y.label}</h2><p>Confidences: ${Object.values(
          y.confidences,
        ).map((z) => z.toFixed(2))}</p>`,
      );
    });
  } else {
    predictions.stop();
  }
});

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = createDashboard({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard.page('Data Management').useLeft(w, m).use(cap, trainingSetBrowser);
dashboard.page('Training').use(params, b, prog);
dashboard.page('Batch Prediction').use(predictButton, predictionAccuracy, confusionMatrix);
dashboard.page('Real-time Prediction').useLeft(w).use(tog, results);

dashboard.start();
