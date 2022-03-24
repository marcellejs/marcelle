import type { Stream } from '../../core/stream';
import { ScatterPlot } from './scatter-plot.component';

export function scatterPlot(
  dataset: Stream<number[][]>,
  labels: Stream<string[] | number[]>,
): ScatterPlot {
  return new ScatterPlot(dataset, labels);
}

export type { ScatterPlot };
