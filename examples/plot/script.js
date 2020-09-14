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
const classifier = mlp({ layers: [64, 32], epochs: 20 });
b.$click.subscribe(() => classifier.train(trainingSet));

const params = parameters(classifier);
const prog = progress(classifier);

const trainingLoss = createStream([], true);
const validationLoss = createStream([], true);
const plotLosses = plotter({
  series: [
    { name: 'training loss', data: trainingLoss },
    { name: 'validation loss', data: validationLoss },
  ],
  options: {
    xaxis: { title: { text: 'Epoch' } },
    yaxis: { title: { text: 'Loss' } },
  },
});
plotLosses.name = 'losses';

const trainingAccuracy = createStream([], true);
const validationAccuracy = createStream([], true);
const plotAccuracies = plotter({
  series: [
    { name: 'training accuracy', data: trainingAccuracy },
    { name: 'validation accuracy', data: validationAccuracy },
  ],
  options: {
    xaxis: { title: { text: 'Epoch' } },
    yaxis: { title: { text: 'Accuracy' }, min: 0, max: 1 },
  },
});
plotAccuracies.name = 'accuracies';

createStream(classifier.$training).subscribe((x) => {
  if (x.status === 'start') {
    trainingLoss.set([]);
    validationLoss.set([]);
    trainingAccuracy.set([]);
    validationAccuracy.set([]);
  } else if (x.status === 'epoch') {
    trainingLoss.set(trainingLoss.value.concat([x.data.loss]));
    validationLoss.set(validationLoss.value.concat([x.data.lossVal]));
    trainingAccuracy.set(trainingAccuracy.value.concat([x.data.accuracy]));
    validationAccuracy.set(validationAccuracy.value.concat([x.data.accuracyVal]));
  }
});

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

const confidenceStream = createStream([], true);
const plotConfidences = plotter({
  series: [{ name: 'Confidence', data: confidenceStream }],
  options: {
    chart: { type: 'bar' },
  },
});
plotConfidences.name = 'confidences';

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
      confidenceStream.set(
        Object.entries(y.confidences).map(([label, value]) => ({ x: label, y: value })),
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
  title: 'Marcelle Example - Plots',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard.page('Data Management').useLeft(w, m).use(cap, trainingSetBrowser);
dashboard.page('Training').use(params, b, prog, [plotLosses, plotAccuracies]);
dashboard.page('Batch Prediction').use(predictButton, predictionAccuracy, confusionMatrix);
dashboard.page('Real-time Prediction').useLeft(w).use(tog, results, plotConfidences);

dashboard.start();
