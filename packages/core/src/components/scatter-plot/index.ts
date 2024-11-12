import { ScatterPlot } from './scatter-plot.component';

export function scatterPlot(...args: ConstructorParameters<typeof ScatterPlot>): ScatterPlot {
  return new ScatterPlot(...args);
}

export * from './scatter-plot.component';
