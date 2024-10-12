import { confidencePlot } from '@marcellejs/core';
import { tst } from './data';
import { classifier } from './training';
import { mergeWith, filter, map, mergeMap, from } from 'rxjs';
import { slider, text } from '@marcellejs/gui-widgets';

const hint = text('Change slider values or select a data point in the table at the bottom');
hint.title = 'hint';

const sepalLength = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 20 });
sepalLength.title = 'Sepal Length (cm)';
sepalLength.$values.next([5.1]);
const sepalWidth = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 20 });
sepalWidth.title = 'Sepal Width (cm)';
sepalWidth.$values.next([3.5]);
const petalLength = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 20 });
petalLength.title = 'Petal Length (cm)';
petalLength.$values.next([1.4]);
const petalWidth = slider({ min: 0, max: 10, pips: true, step: 0.1, pipstep: 20 });
petalWidth.title = 'Petal Width (cm)';
petalWidth.$values.next([0.2]);

tst.$selection.pipe(filter((x) => x.length === 1)).subscribe(([x]) => {
  sepalLength.$values.next([x['sepal.length']]);
  sepalWidth.$values.next([x['sepal.width']]);
  petalLength.$values.next([x['petal.length']]);
  petalWidth.$values.next([x['petal.width']]);
});

const $predictions = sepalLength.$values.pipe(
  mergeWith(sepalWidth.$values, petalLength.$values, petalWidth.$values),
  filter(() => classifier.ready),
  map(() => [
    sepalLength.$values.getValue()[0],
    sepalWidth.$values.getValue()[0],
    petalLength.$values.getValue()[0],
    petalWidth.$values.getValue()[0],
  ]),
  map(classifier.predict),
  mergeMap((x) => from(x)),
);

const predViz = confidencePlot($predictions);

export function setup(dash) {
  dash
    .page('Testing')
    .sidebar(hint)
    .use([sepalLength, sepalWidth, petalLength, petalWidth], predViz, tst);
}
