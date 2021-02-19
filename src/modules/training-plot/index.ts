import { Model } from '../../core';
import { TrainingPlot, LogSpec } from './training-plot.module';

export function trainingPlot(model: Model, logs?: LogSpec): TrainingPlot {
  return new TrainingPlot(model, logs);
}

export type { TrainingPlot };
