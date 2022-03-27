import { genericChart, select } from '@marcellejs/core';
import { ts } from './data';
import './testing';
import './batch-prediction';

const options = ['petal.length', 'petal.width', 'sepal.length', 'sepal.width'];
const selX = select(options, 'petal.length');
selX.title = 'Choose X axis';
const selY = select(options, 'sepal.length');
selY.title = 'Choose Y axis';
const chart = genericChart({ preset: 'scatter' });
ts.ready
  .then(() => ts.distinct('variety'))
  .then((labels) => {
    selX.$value
      .startWith(selX.$value.value)
      .combine((y, x) => [x, y], selY.$value.startWith(selY.$value.value))
      .subscribe(([xKey, yKey]) => {
        chart.clear();
        chart.options.xlabel = xKey;
        chart.options.ylabel = yKey;
        for (const label of labels) {
          chart.addSeries(
            ts
              .items()
              .filter(({ variety }) => variety === label)
              .map((instance) => ({ x: instance[xKey], y: instance[yKey] })),
            label,
          );
        }
      });
  });

export function setup(dash) {
  dash.page('ScatterPlot').use([selX, selY], chart);
}
