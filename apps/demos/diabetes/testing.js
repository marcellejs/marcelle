import { modelParameters, Stream, text } from '@marcellejs/core';
import { testSetTable, features } from './data';
import { model, components } from './model';

const parameters = Object.fromEntries(features.map((s) => [s, new Stream(0, true)]));
const controls = modelParameters({ parameters });
controls.title = 'Choose input values';

testSetTable.$selection
  .filter((x) => x.length === 1)
  .subscribe(([x]) => {
    for (const [key, val] of Object.entries(x)) {
      if (key in parameters) {
        parameters[key].set(val);
      }
    }
  });

const $features = features.reduce((s, x) => {
  return s.combine((vx, vs) => [...vs, vx], parameters[x]);
}, new Stream([], true));

const $predictions = $features
  .filter(() => model.ready)
  .map(model.predict.bind(model))
  .awaitPromises();

const result = text('Waiting for predictions...');
result.title = 'Prediction';
$predictions.subscribe((x) => {
  result.$value.set(`Result: ${x.variable}`);
});

const hint = text(
  'To run the prediction pipeline, either enter values in the number inputs below, or select a particular instance from the test set on the right',
);
hint.title = 'hint';

export function setup(dash) {
  dash.page('Testing (Parameters)').sidebar(hint, controls).use(result, testSetTable);
}
