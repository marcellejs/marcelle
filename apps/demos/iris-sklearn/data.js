import { button, dataset, datasetTable, text } from '@marcellejs/core';
import { parse } from 'https://cdn.skypack.dev/papaparse';
import irisData from './iris.csv?raw';
import { store } from './common';

export const ts = dataset('iris-training-set', store);
export const tst = datasetTable(ts, [
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

const info = text('The dataset is empty');
info.title = 'Dataset Count';
ts.$count.subscribe(async (c) => {
  info.$value.set(`The dataset contains ${c} instances`);
});

export function setup(dash) {
  dash.page('Load Data').sidebar(info, loadDataBtn).use(tst);
  dash.settings.datasets(ts);

  dash.$page.subscribe((p) => {
    tst.singleSelection = p === 'testing';
  });
}
