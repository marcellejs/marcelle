import { genericChart, select } from '@marcellejs/core';
import { ts } from './data';
import './testing';
import './batch-prediction';
import { combineLatest, startWith } from 'rxjs';

const options = ['petal.length', 'petal.width', 'sepal.length', 'sepal.width'];
const selX = select(options, 'petal.length');
selX.title = 'Choose X axis';
const selY = select(options, 'sepal.length');
selY.title = 'Choose Y axis';
const chart = genericChart({ preset: 'scatter' });
ts.ready
  .then(() => ts.distinct('variety'))
  .then((labels) => {
    combineLatest([
      selX.$value.pipe(startWith(selX.$value.getValue())),
      selY.$value.pipe(startWith(selY.$value.getValue())),
    ]).subscribe(([xKey, yKey]) => {
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
