/* eslint-disable no-undef */

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobilenet();

const cap = capture({ input: input.$images, thumbnail: input.$thumbnails });
const instances = new Stream(
  awaitPromises(
    map(
      async (instance) => ({
        ...instance,
        type: 'image',
        features: await featureExtractor.process(instance.data),
      }),
      cap.$instances,
    ),
  ),
);

// const instances = cap.$instances
//   .map(async (instance) => ({
//     ...instance,
//     type: 'image',
//     features: await m.process(instance.data),
//   }))
//   .awaitPromises();

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
const plotTraining = trainingPlotter(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = batchPrediction({ name: 'mlp', backend });
const confusionMatrix = confusion(batchMLP);

const predictButton = button({ text: 'Update predictions' });
predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });

const predictionStream = createStream(
  awaitPromises(
    map(
      async (img) => classifier.predict(await featureExtractor.process(img)),
      filter(() => tog.$checked.value, input.$images),
    ),
  ),
);

// const predictionStream = input.$images
//   .filter(() => tog.$checked.value)
//   .map(async (img) => classifier.predict(await m.process(img)))
//   .awaitPromises();

const plotResults = predictionPlotter(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = createDashboard({
  title: 'Marcelle Starter',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard.page('Data Management').useLeft(input, featureExtractor).use(cap, trainingSetBrowser);
dashboard.page('Training').use(params, b, prog, plotTraining);
dashboard.page('Batch Prediction').use(predictButton, confusionMatrix);
dashboard.page('Real-time Prediction').useLeft(input).use(tog, plotResults);

dashboard.start();
