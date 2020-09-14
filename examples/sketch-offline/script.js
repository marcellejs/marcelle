/* global marcelle, mostCore */

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = marcelle.sketchpad();
const featureExtractor = marcelle.mobilenet();

const instances = marcelle.createStream(
  mostCore.awaitPromises(
    mostCore.map(
      async (instance) => ({
        ...instance,
        type: 'sketch',
        label: 'default',
        features: await featureExtractor.process(instance.data),
      }),
      mostCore.snapshot(
        (thumbnail, data) => ({ thumbnail, data }),
        input.$thumbnails,
        input.$images,
      ),
    ),
  ),
  true,
);

const backend = marcelle.createBackend({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend });
const labelField = marcelle.textfield();
labelField.name = 'label';
labelField.$text.set('...');
const addToDataset = marcelle.button({ text: 'Add to Dataset' });
trainingSet.capture(
  marcelle.createStream(
    mostCore.snapshot(
      (instance) => ({ ...instance, label: labelField.$text.value }),
      instances,
      addToDataset.$click,
    ),
  ),
);

const trainingSetBrowser = marcelle.browser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = marcelle.button({ text: 'Train' });
const classifier = marcelle.mlp({ layers: [64, 32], epochs: 20 });
b.$click.subscribe(() => classifier.train(trainingSet));

const params = marcelle.parameters(classifier);
const prog = marcelle.progress(classifier);
const plotTraining = marcelle.trainingPlotter(classifier);

// -----------------------------------------------------------
// BATCH PREDICTION
// -----------------------------------------------------------

const batchMLP = marcelle.batchPrediction({ name: 'mlp', backend });
const confusionMatrix = marcelle.confusion(batchMLP);

const predictButton = marcelle.button({ text: 'Update predictions' });
predictButton.$click.subscribe(async () => {
  await batchMLP.clear();
  await batchMLP.predict(classifier, trainingSet);
});

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const tog = marcelle.toggle({ text: 'toggle prediction' });

const predictionStream = marcelle.createStream(
  mostCore.awaitPromises(
    mostCore.map(
      async (img) => classifier.predict(await featureExtractor.process(img)),
      mostCore.filter(() => tog.$checked.value, input.$images),
    ),
  ),
);

// const predictionStream = input.$images
//   .filter(() => tog.$checked.value)
//   .map(async (img) => classifier.predict(await m.process(img)))
//   .awaitPromises();

const plotResults = marcelle.predictionPlotter(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle Example - Sketch (Offline)',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard
  .page('Data Management')
  .useLeft(input, featureExtractor)
  .use([labelField, addToDataset], trainingSetBrowser);
dashboard.page('Training').use(params, b, prog, plotTraining);
dashboard.page('Batch Prediction').use(predictButton, confusionMatrix);
dashboard.page('Real-time Prediction').useLeft(input).use(tog, plotResults);

dashboard.start();
