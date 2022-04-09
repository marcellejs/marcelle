import { text } from '@marcellejs/core';
import { testSetTable } from './data';
import { $predictions } from './testing-sliders';

const result = text('Waiting for predictions...');
result.title = 'Prediction';
$predictions.subscribe((x) => {
  result.$value.set(`Result: ${x}`);
});

const hint = text(
  'To run the prediction pipeline, either enter values in the number inputs below, or select a particular instance from the test set on the right',
);
hint.title = 'hint';

export function setup(dash) {
  dash.page('Testing (Parameters)').sidebar(hint).use(result, testSetTable);
}
