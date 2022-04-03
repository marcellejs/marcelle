import { slider, Stream, text } from '@marcellejs/core';
import { testSetTable, features } from './data';
import { model } from './model';

const sliders = Object.fromEntries(
  features.map((featureName) => {
    const s = slider({ min: -0.2, max: 0.2, pips: true, step: 0.001, pipstep: 100 });
    s.title = featureName;
    s.$values.set([0]);
    return [featureName, s];
  }),
);

testSetTable.$selection
  .filter((x) => x.length === 1)
  .subscribe(([x]) => {
    for (const [key, val] of Object.entries(x)) {
      if (features.includes(key)) {
        sliders[key].$values.set([val]);
      }
    }
  });

const $features = features.reduce((s, x) => {
  return s.combine((vx, vs) => [...vs, vx], sliders[x].$values);
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

export function setup(dash) {
  dash
    .page('Testing (sliders)')
    .sidebar(...Object.values(sliders))
    .use(result, testSetTable);
}
