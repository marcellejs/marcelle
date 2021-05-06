/* eslint-disable import/extensions */
import '../../dist/marcelle.css';
import {
  datasetBrowser,
  button,
  dashboard,
  dataset,
  dataStore,
  mobileNet,
  textField,
  toggle,
  webcam,
  kmeansClustering,
  modelParameters,
  scatterPlot,
  throwError,
  confidencePlot,
} from '../../dist/marcelle.esm.js';

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobileNet();

const label = textField();
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

const clusteringKMeans = kmeansClustering({ k: 3, dataStore: store });
const params = modelParameters(clusteringKMeans);

b.$click.subscribe(() => {
  clusteringKMeans.train(trainingSet);
});

// -----------------------------------------------------------
// PLOT CLUSTERS
// -----------------------------------------------------------

const featureStream = trainingSet.$instances
  .map(() => trainingSet.getAllInstances(['features']))
  .awaitPromises()
  .map((c) => c.map((x) => [x.features[0][0], x.features[0][1]]));

const clusteringScatterPlot = scatterPlot(featureStream, clusteringKMeans.$clusters);

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

const predPlot = confidencePlot(predictionStream);

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
  .use(b, params, clusteringScatterPlot)
  .use(tog, predPlot);
dash.page('Training').useLeft(input, featureExtractor).use(b);
dash.settings.dataStores(store).datasets(trainingSet);

dash.start();
