import '../../dist/marcelle.css';
import {
  batchPrediction,
  button,
  confidencePlot,
  confusionMatrix,
  dashboard,
  dataset,
  datasetTable,
  dataStore,
  mlpClassifier,
  modelParameters,
  slider,
  text,
  trainingPlot,
  trainingProgress,
} from '../../dist/marcelle.esm';
import { parse } from 'https://cdn.skypack.dev/papaparse';
import irisData from './iris.csv?raw';

const store = dataStore('localStorage');
const ts = dataset('iris-training-set', store);
const tst = datasetTable(ts, [
  'variety',
  'sepal.length',
  'sepal.width',
  'petal.length',
  'petal.width',
]);

async function loadData() {
  await ts.clear();
  const { data: iris, errors } = parse(irisData, { header: true, dynamicTyping: true });
  if (errors.length > 0) {
    for (const err of errors) {
      if (err.code === 'TooFewFields') {
        iris.splice(err.row, 1);
      }
    }
  }
  for (const instance of iris) {
    await ts.create(instance);
  }
}

const loadDataBtn = button('Load Data');
loadDataBtn.$click.subscribe(loadData);

const info = text({ text: 'The dataset is empty' });
info.title = 'Dataset Count';
ts.$count.subscribe(async (c) => {
  info.$text.set(`The dataset contains ${c} instances`);
});

const classifier = mlpClassifier({ dataStore: store }).sync('iris-classifier');
const params = modelParameters(classifier);

function processDataset() {
  return ts.items().map((instance) => ({
    x: [
      [
        instance['sepal.length'],
        instance['sepal.width'],
        instance['petal.length'],
        instance['petal.width'],
      ],
    ],
    y: instance.variety,
  }));
}

const trainBtn = button('Train the classifier');
trainBtn.$click.subscribe(() => {
  const ds = processDataset();
  classifier.train(ds);
});

const prog = trainingProgress(classifier);
const graphs = trainingPlot(classifier);

const sepalLength = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 100 });
sepalLength.title = 'Sepal Length';
sepalLength.$values.set([5.1]);
const sepalWidth = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 100 });
sepalWidth.title = 'Sepal Width';
sepalWidth.$values.set([3.5]);
const petalLength = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 100 });
petalLength.title = 'Petal Length';
petalLength.$values.set([1.4]);
const petalWidth = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 100 });
petalWidth.title = 'Petal Width';
petalWidth.$values.set([0.2]);

tst.$selection
  .filter((x) => x.length === 1)
  .subscribe(([x]) => {
    sepalLength.$values.set([x['sepal.length']]);
    sepalWidth.$values.set([x['sepal.width']]);
    petalLength.$values.set([x['petal.length']]);
    petalWidth.$values.set([x['petal.width']]);
  });

const $predictions = sepalLength.$values
  .merge(sepalWidth.$values)
  .merge(petalLength.$values)
  .merge(petalWidth.$values)
  .filter(() => classifier.ready)
  .map(() => [
    [
      sepalLength.$values.value[0],
      sepalWidth.$values.value[0],
      petalLength.$values.value[0],
      petalWidth.$values.value[0],
    ],
  ])
  .map(classifier.predict.bind(classifier))
  .awaitPromises();

const predViz = confidencePlot($predictions);

const bp = batchPrediction({ name: 'iris-predictions' });
const batchButton = button('Update Predictions');
batchButton.title = 'Batch prediction';
batchButton.$click.subscribe(() => {
  bp.predict(classifier, processDataset());
});
const conf = confusionMatrix(bp);

const dash = dashboard({
  title: 'Iris Classification',
  author: 'Marcelle Doe',
});

dash.page('Training').sidebar(info, loadDataBtn).use(tst, params, trainBtn, prog, graphs);
dash.page('Testing').use([sepalLength, sepalWidth, petalLength, petalWidth], predViz, tst);
dash.page('Batch prediction').use(batchButton, conf);
dash.settings.datasets(ts).models(classifier).dataStores(store);

dash.$page.subscribe((p) => {
  tst.singleSelection = p === 'testing';
});

dash.show();
