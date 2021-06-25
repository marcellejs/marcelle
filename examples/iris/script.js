import '../../dist/marcelle.css';
import {
  button,
  confidencePlot,
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
const tst = datasetTable(ts);
tst.$columns.set([
  'variety',
  'sepal.length',
  'sepal.width',
  'petal.length',
  'petal.width',
  'updatedAt',
]);

async function loadData() {
  await ts.clear();
  const { data: iris } = parse(irisData, { header: true, dynamicTyping: true });
  for (const instance of iris) {
    await ts.create(instance);
  }
}

const loadDataBtn = button({ text: 'Load Data' });
loadDataBtn.$click.subscribe(loadData);

const info = text({ text: 'The dataset is empty' });
info.title = 'Dataset Count';
ts.$count.subscribe(async (c) => {
  info.$text.set(`The dataset contains ${c} instances`);
});

const classifier = mlpClassifier({ dataStore: store }).sync('iris-classifier');
const params = modelParameters(classifier);

async function train() {
  const ds = ts.items().map((instance) => ({
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
  classifier.train(ds);
}

const trainBtn = button({ text: 'Train the classifier' });
trainBtn.$click.subscribe(train);

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

const dash = dashboard({
  title: 'Iris Classification',
  author: 'Marcelle Doe',
});

dash.page('Training').sidebar(info, loadDataBtn).use(tst, params, trainBtn, prog, graphs);
dash.page('Testing').use([sepalLength, sepalWidth, petalLength, petalWidth], predViz);
dash.settings.datasets(ts).models(classifier).dataStores(store);

dash.show();
