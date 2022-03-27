import { genericChart } from '@marcellejs/core';
import { ts } from './data';
import './testing';
import './batch-prediction';

const chart = genericChart({
  preset: 'scatter',
  options: { xlabel: 'petal.length', ylabel: 'petal.width' },
});
ts.ready
  .then(() => ts.distinct('variety'))
  .then((labels) => {
    for (const label of labels) {
      chart.addSeries(
        ts
          .items()
          .filter(({ variety }) => variety === label)
          .map((instance) => ({ x: instance['petal.length'], y: instance['petal.width'] })),
        label,
      );
    }
  });

export function setup(dash) {
  dash.page('Simple ScatterPlot').use(chart);
}
