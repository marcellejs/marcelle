/* eslint-disable import/extensions */
import '../../dist/marcelle.css';
import {
  datasetBrowser,
  button,
  dashboard,
  dataset,
  dataStore,
  mobilenet,
  clusteringPlot,
  textfield,
  toggle,
  webcam,
  kmeans,
  parameters,
  throwError,
  classificationPlot,
} from '../../dist/marcelle.esm.js';

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobilenet();

const label = textfield();
label.title = 'Instance label';
const capture = button({ text: 'Hold to record instances' });
capture.title = 'Capture instances to the training set';

const instances = input.$images
  .filter(() => capture.$down.value)
  .map(async (img) => ({
    type: 'image',
    data: img,
    label: label.$text.value,
    thumbnail: input.$thumbnails.value,
    features: await featureExtractor.process(img),
  }))
  .awaitPromises();

const store = dataStore({ location: 'localStorage' });
const trainingSet = dataset({ name: 'TrainingSet', dataStore: store });
trainingSet.capture(instances);

const trainingSetBrowser = datasetBrowser(trainingSet);

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button({ text: 'Train' });
b.title = 'Training k-means';

const clusteringKMeans = kmeans({ k: 3, dataStore: store }).sync('knn-vs-mlp-knn');
const params = parameters(clusteringKMeans);

b.$click.subscribe(() => {
  clusteringKMeans.train(trainingSet);
});

const pltClusteringRes = clusteringPlot(trainingSet);

clusteringKMeans.$clusters.subscribe(() => {
  pltClusteringRes.render(clusteringKMeans);
});

// -----------------------------------------------------------
// REALTIME CLUSTER PREDICTION
// -----------------------------------------------------------

const tog = toggle({ text: 'toggle prediction' });
tog.$checked.subscribe((checked) => {
  if (checked && !clusteringKMeans.ready) {
    throwError(new Error('No classifier has been trained'));
    setTimeout(() => {
      tog.$checked.set(false);
    }, 500);
  }
});

const predictionStream = input.$images
  .filter(() => tog.$checked.value && clusteringKMeans.ready)
  .map(async (img) => clusteringKMeans.predict(await featureExtractor.process(img)))
  .awaitPromises();

const predPlot = classificationPlot(predictionStream);

// -----------------------------------------------------------
// DASHBOARDS
// -----------------------------------------------------------

const dash = dashboard({
  title: 'Marcelle Example - MLP vs KNN',
  author: 'Marcelle Pirates Crew',
});

dash
  .page('Data Management')
  .useLeft(input, featureExtractor)
  .use([label, capture], trainingSetBrowser)
  .use(b, params, pltClusteringRes)
  .use(tog, predPlot);
dash.page('Training').useLeft(input, featureExtractor).use(b, pltClusteringRes);
dash.settings.dataStores(store).datasets(trainingSet);

dash.start();
