import { TrainingPlot } from './training-plot.module';
import { MLP } from '../mlp';

export function trainingPlot(model: MLP): TrainingPlot {
  return new TrainingPlot(model);
}

export type { TrainingPlot };
