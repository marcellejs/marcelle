import { modelParameters, text } from '@marcellejs/core';
import { BehaviorSubject, combineLatest, auditTime, filter, from, map, mergeMap } from 'rxjs';
import { testSetTable, features } from './data';
import { model } from './model';

const parameters = Object.fromEntries(features.map((s) => [s, new BehaviorSubject(0)]));
const controls = modelParameters({ parameters });
controls.title = 'Choose input values';

testSetTable.$selection.pipe(filter((x) => x.length === 1)).subscribe(([x]) => {
  for (const [key, val] of Object.entries(x)) {
    if (key in parameters) {
      parameters[key].next(val);
    }
  }
});

const $features = combineLatest(features.map((x) => parameters[x]));

const $predictions = $features.pipe(
  filter(() => model.ready),
  auditTime(20),
  map(model.predict),
  mergeMap((x) => from(x)),
);

const result = text('Waiting for predictions...');
result.title = 'Prediction';
$predictions.subscribe((x) => {
  result.$value.next(`Result: ${x.variable}`);
});

const hint = text(
  'To run the prediction pipeline, either enter values in the number inputs below, or select a particular instance from the test set on the right',
);
hint.title = 'hint';

export function setup(dash) {
  dash.page('Testing (Parameters)').sidebar(hint, controls).use(result, testSetTable);
}
