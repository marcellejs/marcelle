import { Model } from '../../core';
import { TrainingPlot, LogSpec } from './training-plot.component';

export function trainingPlot<T, U>(model: Model<T, U>, logs?: LogSpec): TrainingPlot<T, U> {
  return new TrainingPlot(model, logs);
}

export type { TrainingPlot };
