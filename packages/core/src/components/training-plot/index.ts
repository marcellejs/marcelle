import { TrainingPlot } from './training-plot.component';

export function trainingPlot(...args: ConstructorParameters<typeof TrainingPlot>): TrainingPlot {
  return new TrainingPlot(...args);
}

export * from './training-plot.component';
