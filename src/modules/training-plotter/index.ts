import { TrainingPlotter } from './training-plotter.module';
import { MLP } from '../mlp';

export function trainingPlotter(model: MLP): TrainingPlotter {
  return new TrainingPlotter(model);
}

export type { TrainingPlotter };
