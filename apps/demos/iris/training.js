import {
  button,
  mlpClassifier,
  modelParameters,
  trainingPlot,
  trainingProgress,
} from '@marcellejs/core';
import { store } from './common';
import { processDataset } from './preprocessing';

export const classifier = mlpClassifier({ dataStore: store }).sync('iris-classifier');
const params = modelParameters(classifier);

const trainBtn = button('Train the classifier');
trainBtn.$click.subscribe(() => {
  const ds = processDataset();
  classifier.train(ds);
});

const prog = trainingProgress(classifier);
const graphs = trainingPlot(classifier);

export function setup(dash) {
  dash.page('Training').use(params, trainBtn, prog, graphs);
  dash.settings.models(classifier);
}
