import { button, modelParameters, trainingPlot, trainingProgress } from '@marcellejs/core';
import { store } from './common';
import { regressor } from './components';
// Note: the demo works with the built-in mlpRegressor component:
// import { mlpRegressor as regressor } from '@marcellejs/core';
import { features, trainingSet } from './data';

export const model = regressor().sync(store, 'diabetes-tfjs-regressor');
model.$training.subscribe(console.log);

const b = button('Train');
b.title = 'Training Launcher';

b.$click.subscribe(() => {
  const ds = trainingSet
    .items()
    .map(async (instance) => ({ x: features.map((key) => instance[key]), y: instance.target }));
  return model.train(ds);
});

const params = modelParameters(model);
const prog = trainingProgress(model);
const plotTraining = trainingPlot(model, {
  Loss: ['loss', 'lossVal'],
  'Mean Absolute Error': ['meanAbsoluteError2', 'meanAbsoluteError2Val'],
});

export const components = [params, prog, plotTraining, model];

export function setup(dash) {
  dash.page('Train Model').use(params, b, prog, plotTraining);
  dash.settings.models(model);
}
