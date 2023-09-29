import { slider, text } from '@marcellejs/core';
import { combineLatest, filter, from, map, mergeMap } from 'rxjs';
import { testSetTable, features } from './data';
import { model } from './model';

const sliders = Object.fromEntries(
  features.map((featureName) => {
    const s = slider({ min: -0.2, max: 0.2, pips: true, step: 0.001, pipstep: 100 });
    s.title = featureName;
    s.$values.next([0]);
    return [featureName, s];
  }),
);

testSetTable.$selection.pipe(filter((x) => x.length === 1)).subscribe(([x]) => {
  for (const [key, val] of Object.entries(x)) {
    if (features.includes(key)) {
      sliders[key].$values.next([val]);
    }
  }
});

const $features = combineLatest(features.map((x) => sliders[x].$values.pipe(map((z) => z[0]))));

const $predictions = $features.pipe(
  filter(() => model.ready),
  map(model.predict),
  mergeMap((x) => from(x)),
);

const result = text('Waiting for predictions...');
result.title = 'Prediction';
$predictions.subscribe((x) => {
  result.$value.next(`Result: ${x.variable}`);
});

export function setup(dash) {
  dash
    .page('Testing (sliders)')
    .sidebar(...Object.values(sliders))
    .use(result, testSetTable);
}
