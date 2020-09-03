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

backend.createService('predictions');
const predictButton = button({ text: 'Update predictions' });
const predictionAccuracy = text({ text: 'Waiting for predictions...' });

async function clearPredictions() {
  const { data } = await backend.service('predictions').find({
    query: { $select: ['id'] },
  });
  return Promise.all(data.map(({ id }) => backend.service('predictions').remove(id)));
}

async function computeAccuracy(predictions) {
  const pred = await Promise.all(
    predictions.map(({ label, instanceId }) =>
      trainingSet.instanceService
        .get(instanceId, { query: { $select: ['label'] } })
        .then((x) => (x.label === label ? 1 : 0)),
    ),
  );
  const accuracy = pred.reduce((x, y) => x + y, 0) / predictions.length;
  predictionAccuracy.$text.set(`Global Accuracy: ${accuracy}`);
}

predictButton.$click.subscribe(async () => {
  await clearPredictions();
  const { data } = await trainingSet.instanceService.find({
    query: { $select: ['id', 'features'] },
  });
  await Promise.all(
    data.map(({ id, features }) => {
      const prediction = classifier.predict(features);
      return backend.service('predictions').create({ ...prediction, instanceId: id });
    }),
  );
  const pred = await backend.service('predictions').find();
  computeAccuracy(pred.data);
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
});

dashboard.page('Data Management').useLeft(w, m).use(cap, trainingSetBrowser);
dashboard.page('Training').use(params, b, prog);
dashboard.page('Batch Prediction').use(predictButton, predictionAccuracy);
dashboard.page('Real-time Prediction').useLeft(w).use(tog, results);

dashboard.start();
