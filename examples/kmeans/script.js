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
  webcam,
  kmeans,
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
b.title = 'Training Launcher';

// KMeans
const clusteringKMeans = kmeans({ k: 3, steps: 10, dataStore: store }).sync('knn-vs-mlp-knn');

b.$click.subscribe(() => {
  clusteringKMeans.train(trainingSet);
});

const pltClusteringRes = clusteringPlot(trainingSet);

clusteringKMeans.$clusters.subscribe(() => {
  // pltClusteringRes.setClusters(clusteringKMeans.$clusters);
  pltClusteringRes.render(clusteringKMeans);
});

// VIZ

// clusteringKMeans.$centers.subscribe(() => {
//   console.log('centers', clusteringKMeans.$centers.value);
// });

// -----------------------------------------------------------
// PREDICTION
// -----------------------------------------------------------

// const tog = toggle({ text: 'toggle prediction' });

// const rtFeatureStream = input.$images
//   .filter(() => tog.$checked.value)
//   .map(async (img) => featureExtractor.process(img))
//   .awaitPromises();

// const predictionClustering = rtFeatureStream
//   .map(async (features) => ClusteringKMeans.predict(features))
//   .awaitPromises();

// const plotResultsKMeans = clusteringPlot(predictionClustering);
// const plotResultsMLP = predictionPlot(predictionStreamMLP);
// plotResultsMLP.title = 'Predictions: MLP';
// const plotResultsKNN = predictionPlot(predictionStreamKNN);
// plotResultsKNN.title = 'Predictions: KNN';

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
  .use(b, pltClusteringRes);
dash.page('Training').useLeft(input, featureExtractor).use(b, pltClusteringRes);
dash.settings.dataStores(store).datasets(trainingSet);

dash.start();
