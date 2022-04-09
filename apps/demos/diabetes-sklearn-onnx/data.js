import { button, dataset, datasetTable, text } from '@marcellejs/core';
import { parse } from 'https://cdn.skypack.dev/papaparse';
import trainData from './diabetes_train_set.csv?raw';
import testData from './diabetes_test_set.csv?raw';
import { store } from './common';

export const features = ['age', 'sex', 'bmi', 'bp', 's1', 's2', 's3', 's4', 's5', 's6'];
const columns = ['target', ...features, 'createdAt'];

export const trainingSet = dataset('diabetes-training-set', store);
export const trainingSetTable = datasetTable(trainingSet, columns);
trainingSetTable.title = 'Training Set';
export const testSet = dataset('diabetes-test-set', store);
export const testSetTable = datasetTable(testSet, columns);
testSetTable.title = 'Test Set';

async function loadData(ds, rawCsv) {
  await ds.clear();
  const { data, errors } = parse(rawCsv, { header: true, dynamicTyping: true });
  if (errors.length > 0) {
    for (const err of errors) {
      if (err.code === 'TooFewFields') {
        data.splice(err.row, 1);
      }
    }
  }
  for (const instance of data) {
    await ds.create(instance);
  }
}

const loadDataBtn = button('Load Data');
loadDataBtn.title = 'Load training/test data from CSV files';
loadDataBtn.$click.subscribe(() => {
  loadData(trainingSet, trainData);
  loadData(testSet, testData);
});

const info = text('The dataset is empty');
info.title = 'Dataset Count';
trainingSet.$count
  .combine((a, b) => [a, b], testSet.$count)
  .subscribe(async ([testCount, trainCount]) => {
    info.$value.set(
      `Datasets contain ${trainCount} instances for training and ${testCount} instances for testing`,
    );
  });

export function setup(dash) {
  dash.page('Load Data').sidebar(loadDataBtn, info).use(trainingSetTable, testSetTable);
  dash.settings.datasets(trainingSet, testSet);

  dash.$page.subscribe((p) => {
    trainingSetTable.singleSelection = p.includes('testing');
    testSetTable.singleSelection = p.includes('testing');
  });
}
