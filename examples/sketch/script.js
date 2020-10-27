/* global marcelle */

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = marcelle.sketchpad();
const featureExtractor = marcelle.mobilenet();

const instances = input.$images
  .hold()
  .snapshot((thumbnail, data) => ({ thumbnail, data }), input.$thumbnails)
  .map(async (instance) => ({
    ...instance,
    type: 'sketch',
    label: 'default',
    features: await featureExtractor.process(instance.data),
  }))
  .awaitPromises();

const backend = marcelle.createBackend({ location: 'localStorage' });
const trainingSet = marcelle.dataset({ name: 'TrainingSet', backend });
const labelField = marcelle.textfield();
labelField.name = 'Correct the prediction if necessary';
labelField.$text.set('...');
const addToDataset = marcelle.button({ text: 'Add to Dataset and Train' });
addToDataset.name = 'Improve the classifier';
trainingSet.capture(
  addToDataset.$click.snapshot(
    (instance) => ({ ...instance, label: labelField.$text.value }),
    instances,
  ),
);

const trainingSetBrowser = marcelle.browser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = marcelle.button({ text: 'Train' });
const classifier = marcelle.mlp({ layers: [64, 32], epochs: 20 });

b.$click.subscribe(() => classifier.train(trainingSet));
trainingSet.$created.subscribe(() => classifier.train(trainingSet));

const params = marcelle.parameters(classifier);
const prog = marcelle.progress(classifier);
const plotTraining = marcelle.trainingPlot(classifier);

// -----------------------------------------------------------
// REAL-TIME PREDICTION
// -----------------------------------------------------------

const predictionStream = classifier.$training
  .filter((x) => x.status === 'success')
  .sample(instances)
  .merge(instances)
  .map(async ({ features }) => classifier.predict(features))
  .awaitPromises()
  .filter((x) => !!x);

predictionStream.subscribe(({ label }) => {
  labelField.$text.set(label);
});

const plotResults = marcelle.predictionPlot(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dashboard = marcelle.createDashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
});

dashboard
  .page('Online Learning')
  .useLeft(input, featureExtractor)
  .use(plotResults, [labelField, addToDataset], prog, trainingSetBrowser);
dashboard.page('Offline Training').useLeft(trainingSetBrowser).use(params, b, prog, plotTraining);
dashboard.settings.use(trainingSet);

dashboard.start();

backend.authenticate().then(() => {
  trainingSet.$count.take(1).subscribe((c) => {
    if (c) {
      setTimeout(() => {
        classifier.train(trainingSet);
      }, 200);
    }
  });
});
