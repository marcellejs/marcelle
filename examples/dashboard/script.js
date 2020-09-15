/* global marcelle, mostCore */

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = marcelle.webcam();
const featureExtractor = marcelle.mobilenet();

const label = marcelle.textfield();
label.name = 'Instance label';
const capture = marcelle.button({ text: 'Hold to record instances' });
capture.name = 'Capture instances to the training set';

const instances = input.$images
  .thru(mostCore.filter(() => capture.$down.value))
  .thru(
    mostCore.map(async (img) => ({
      type: 'image',
      data: img,
      label: label.$text.value,
      thumbnail: input.$thumbnails.value,
      features: await featureExtractor.process(img),
    })),
  )
  .thru(mostCore.awaitPromises);

const backend = marcelle.createBackend({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend });
trainingSet.capture(instances);

const trainingSetBrowser = marcelle.browser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = marcelle.button({ text: 'Train' });
b.name = 'Training Launcher';
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

const predictionStream = input.$images
  .thru(mostCore.filter(() => tog.$checked.value))
  .thru(mostCore.map(async (img) => classifier.predict(await featureExtractor.process(img))))
  .thru(mostCore.awaitPromises);

const plotResults = marcelle.predictionPlotter(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
  datasets: [trainingSet],
});

dashboard
  .page('Data Management')
  .useLeft(input, featureExtractor)
  .use([label, capture], trainingSetBrowser);
dashboard.page('Training').use(params, b, prog, plotTraining);
dashboard.page('Batch Prediction').use(predictButton, confusionMatrix);
dashboard.page('Real-time Prediction').useLeft(input).use(tog, plotResults);

dashboard.start();
