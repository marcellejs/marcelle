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
  pca,
} from '@marcellejs/core';
import { filter, from, map, mergeMap, Subject, zip } from 'rxjs';

// -----------------------------------------------------------
// INPUT PIPELINE & CAPTURE TO DATASET
// -----------------------------------------------------------

const input = webcam();
const featureExtractor = mobileNet();

const capture = button('Hold to record instances');
capture.title = 'Capture instances to the training set';

const store = dataStore('localStorage');
const trainingSet = dataset('training-set-kmeans', store);
const trainingSetBrowser = datasetBrowser(trainingSet);
const trainingSetScatter = datasetScatter(trainingSet);

trainingSetScatter.$clicked.subscribe(console.log);
trainingSetScatter.$hovered.subscribe(console.log);

zip(input.$images, input.$thumbnails)
  .pipe(
    filter(() => capture.$pressed.getValue()),
    map(async ([img, thumbnail]) => ({
      x: await featureExtractor.process(img),
      y: '?',
      thumbnail,
    })),
    mergeMap((x) => from(x)),
  )
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

clusteringKMeans.$training.pipe(filter(({ status }) => status === 'success')).subscribe(() => {
  trainingSetScatter.setTransforms({
    label: (instance) => clusteringKMeans.predict(instance.x).then(({ cluster }) => cluster),
  });
});

// -----------------------------------------------------------
// PLOT CLUSTERS
// -----------------------------------------------------------
const $features2d = new Subject([]);

async function resetScatterPlot() {
  const allInstances = await trainingSet.items().select(['x']).toArray();
  $features2d.next(allInstances.map((x) => [x.x[0], x.x[1]]));
}

trainingSet.$changes.subscribe(async (changes) => {
  for (const { level, type, data } of changes) {
    if (level === 'instance' && type === 'created') {
      $features2d.next([[data.x[0], data.x[1]]]);
    } else if (level === 'instance' && type === 'removed') {
      $features2d.next([[data.x[0], data.x[1]]]);
    } else {
      resetScatterPlot();
    }
  }
});

clusteringKMeans.$training
  .pipe(filter(({ status }) => status === 'success'))
  .subscribe(resetScatterPlot);

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

dash.settings.dataStores(store).models(clusteringKMeans).datasets(trainingSet);

dash.show();
