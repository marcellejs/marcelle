/* eslint-disable import/extensions */
import '../../dist/marcelle.css';
import {
  datasetBrowser,
  button,
  dashboard,
  dataset,
  dataStore,
  mlp,
  mobilenet,
  parameters,
  classificationPlot,
  trainingProgress,
  sketchpad,
  textfield,
  trainingPlot,
} from '../../dist/marcelle.esm.js';

// -----------------------------------------------------------
// INPUT PIPELINE & DATA CAPTURE
// -----------------------------------------------------------

const input = sketchpad();
const featureExtractor = mobilenet();

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

const store = dataStore({ location: 'localStorage' });
const trainingSet = dataset({ name: 'TrainingSet-sketch', dataStore: store });

const labelField = textfield();
labelField.title = 'Correct the prediction if necessary';
labelField.$text.set('...');
const addToDataset = button({ text: 'Add to Dataset and Train' });
addToDataset.title = 'Improve the classifier';
trainingSet.capture(
  addToDataset.$click.snapshot(
    (instance) => ({ ...instance, label: labelField.$text.value }),
    instances,
  ),
);

const trainingSetBrowser = datasetBrowser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
const classifier = mlp({ layers: [64, 32], epochs: 20 });

b.$click.subscribe(() => classifier.train(trainingSet));
trainingSet.$changes.subscribe((changes) => {
  for (let i = 0; i < changes.length; i++) {
    if (changes[i].level === 'instance' && changes[i].type === 'created') {
      classifier.train(trainingSet);
      break;
    }
  }
});

const params = parameters(classifier);
const prog = trainingProgress(classifier);
const plotTraining = trainingPlot(classifier);

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

const plotResults = classificationPlot(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - Dashboard',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Online Learning')
  .useLeft(input, featureExtractor)
  .use(plotResults, [labelField, addToDataset], prog, trainingSetBrowser);
dash.page('Offline Training').useLeft(trainingSetBrowser).use(params, b, prog, plotTraining);
dash.settings.dataStores(store).datasets(trainingSet).models(classifier, featureExtractor);

dash.start();

store.authenticate().then(() => {
  trainingSet.$count.take(1).subscribe((c) => {
    if (c) {
      setTimeout(() => {
        classifier.train(trainingSet);
      }, 200);
    }
  });
});
