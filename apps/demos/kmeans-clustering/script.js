import '@marcellejs/core/dist/marcelle.css';
import {
  datasetBrowser,
  button,
  dashboard,
  dataset,
  dataStore,
  mobileNet,
  textInput,
  toggle,
  webcam,
  kmeansClustering,
  modelParameters,
  scatterPlot,
  throwError,
  confidencePlot,
  Stream,
} from '@marcellejs/core';

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobileNet();

const label = textInput();
label.title = 'Instance label';
const capture = button('Hold to record instances');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

input.$images
  .filter(() => capture.$pressed.value)
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    thumbnail: input.$thumbnails.value,
    y: label.$value.value,
  }))
  .awaitPromises()
  .subscribe(trainingSet.create.bind(trainingSet));

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button('Train');
b.title = 'Training k-means';

const clusteringKMeans = kmeansClustering({ k: 3, dataStore: store });
const params = modelParameters(clusteringKMeans);

b.$click.subscribe(() => {
  clusteringKMeans.train(trainingSet);
});

// -----------------------------------------------------------
// PLOT CLUSTERS
// -----------------------------------------------------------

const featureStream = new Stream([]);
trainingSet.$changes.subscribe(async (changes) => {
  for (const { level, type, data } of changes) {
    if (level === 'instance' && type === 'created') {
      featureStream.set([[data.x[0], data.x[1]]]);
    } else if (level === 'instance' && type === 'removed') {
      featureStream.set([[data.x[0], data.x[1]]]);
    } else {
      const allInstances = await trainingSet.items().select(['x']).toArray();
      featureStream.set(allInstances.map((x) => [x.x[0][0], x.x[0][1]]));
    }
  }
});

const clusteringScatterPlot = scatterPlot(featureStream, clusteringKMeans.$clusters);

// -----------------------------------------------------------
// REALTIME CLUSTER PREDICTION
// -----------------------------------------------------------

const tog = toggle('toggle prediction');
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
  .sidebar(input, featureExtractor)
  .use([label, capture], trainingSetBrowser)
  .use(params, [b, tog])
  .use([clusteringScatterPlot, predPlot]);
dash.page('Training').sidebar(input, featureExtractor).use(b);
dash.settings.dataStores(store).datasets(trainingSet);

dash.show();
