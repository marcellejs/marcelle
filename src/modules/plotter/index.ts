import { Plotter, PlotterOptions } from './plotter.module';

export function plotter(options: PlotterOptions): Plotter {
  return new Plotter(options);
}

export type { Plotter, PlotterOptions };
