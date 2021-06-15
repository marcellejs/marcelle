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
  Stream,
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

const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet', store);
const trainingSetBrowser = datasetBrowser(trainingSet);

input.$images
  .filter(() => capture.$pressed.value)
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    thumbnail: input.$thumbnails.value,
    y: label.$text.value,
  }))
  .awaitPromises()
  .subscribe(trainingSet.create.bind(trainingSet));

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

const featureStream = new Stream([]);
trainingSet.$changes.subscribe(async (changes) => {
  for (const { level, type, data } of changes) {
    console.log('changing', level, type, data);
    if (level === 'instance' && type === 'created') {
      featureStream.set([data.x[0], data.x[1]]);
    } else if (level === 'instance' && type === 'removed') {
      featureStream.set([data.x[0], data.x[1]]);
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
  .sidebar(input, featureExtractor)
  .use([label, capture], trainingSetBrowser)
  .use(params, [b, tog])
  .use([clusteringScatterPlot, predPlot]);
dash.page('Training').sidebar(input, featureExtractor).use(b);
dash.settings.dataStores(store).datasets(trainingSet);

dash.show();
