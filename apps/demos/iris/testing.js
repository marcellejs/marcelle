import { confidencePlot, slider } from '@marcellejs/core';
import { tst } from './data';
import { classifier } from './training';

const sepalLength = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 20 });
sepalLength.title = 'Sepal Length (cm)';
sepalLength.$values.set([5.1]);
const sepalWidth = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 20 });
sepalWidth.title = 'Sepal Width (cm)';
sepalWidth.$values.set([3.5]);
const petalLength = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 20 });
petalLength.title = 'Petal Length (cm)';
petalLength.$values.set([1.4]);
const petalWidth = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 20 });
petalWidth.title = 'Petal Width (cm)';
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

export function setup(dash) {
  dash.page('Testing').use([sepalLength, sepalWidth, petalLength, petalWidth], predViz, tst);
}
