import '@marcellejs/core/dist/marcelle.css';
import {
  datasetBrowser,
  datasetScatter,
  button,
  dashboard,
  dataset,
  dataStore,
  mobileNet,
  toggle,
  webcam,
  kmeansClustering,
  modelParameters,
  scatterPlot,
  throwError,
  confidencePlot,
  Stream,
  pca,
} from '@marcellejs/core';

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobileNet();

const capture = button('Hold to record instances');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('TrainingSet', store);
const trainingSetBrowser = datasetBrowser(trainingSet);
const trainingSetScatter = datasetScatter(trainingSet);

trainingSetScatter.$clicked.subscribe(console.log);
trainingSetScatter.$hovered.subscribe(console.log);

input.$images
  .filter(() => capture.$pressed.get())
  .map(async (img) => ({
    x: await featureExtractor.process(img),
    y: '?',
    thumbnail: input.$thumbnails.get(),
  }))
  .awaitPromises()
  .subscribe(trainingSet.create);

// -----------------------------------------------------------
// PCA
// -----------------------------------------------------------

const projector = pca();
projector.$training.subscribe(({ status }) => {
  if (status === 'success') {
    trainingSetScatter.setTransforms({
      x: (instance) => projector.predict(instance.x).then((res) => res[0]),
      y: (instance) => projector.predict(instance.x).then((res) => res[1]),
    });
  }
});

const updatePCA = button('Update PCA');
updatePCA.title = 'Update Visualization';

updatePCA.$click.subscribe(() => projector.train(trainingSet));

// -----------------------------------------------------------
// TRAINING
// -----------------------------------------------------------

const b = button('Train');
b.title = 'Training k-means';

const clusteringKMeans = kmeansClustering({ k: 3 });
const params = modelParameters(clusteringKMeans);

b.$click.subscribe(() => {
  clusteringKMeans.train(trainingSet);
});

clusteringKMeans.$training
  .filter(({ status }) => status === 'success')
  .subscribe(() => {
    trainingSetScatter.setTransforms({
      label: (instance) => clusteringKMeans.predict(instance.x).then(({ cluster }) => cluster),
    });
  });

// -----------------------------------------------------------
// PLOT CLUSTERS
// -----------------------------------------------------------
const $features2d = new Stream([]);

async function resetScatterPlot() {
  const allInstances = await trainingSet.items().select(['x']).toArray();
  $features2d.set(allInstances.map((x) => [x.x[0], x.x[1]]));
}

trainingSet.$changes.subscribe(async (changes) => {
  for (const { level, type, data } of changes) {
    if (level === 'instance' && type === 'created') {
      $features2d.set([[data.x[0], data.x[1]]]);
    } else if (level === 'instance' && type === 'removed') {
      $features2d.set([[data.x[0], data.x[1]]]);
    } else {
      resetScatterPlot();
    }
  }
});

clusteringKMeans.$training.filter(({ status }) => status === 'success').subscribe(resetScatterPlot);

const clusteringScatterPlot = scatterPlot($features2d, clusteringKMeans.$clusters);

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
  .filter(() => tog.$checked.get() && clusteringKMeans.ready)
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
  .sidebar(input, featureExtractor, capture, trainingSetBrowser)
  .use(updatePCA, trainingSetScatter);

dash.page('Training').sidebar(params, b).use(trainingSetScatter);
// .use([clusteringScatterPlot, predPlot]);
dash.settings.dataStores(store).models(clusteringKMeans).datasets(trainingSet);

dash.show();
