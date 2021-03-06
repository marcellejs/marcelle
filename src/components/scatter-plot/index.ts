import { ScatterPlot } from './scatter-plot.component';
import { Stream } from '../../core/stream';

export function scatterPlot(
  dataset: Stream<number[][]>,
  labels: Stream<string[] | number[]>,
): ScatterPlot {
  return new ScatterPlot(dataset, labels);
}

export type { ScatterPlot };
