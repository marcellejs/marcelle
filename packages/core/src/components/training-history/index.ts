import type { Instance } from '../../core';
import { TrainingHistory } from './training-history.component';

export function trainingHistory<T extends Instance, PredictionType>(
  ...args: ConstructorParameters<typeof TrainingHistory>
): TrainingHistory<T, PredictionType> {
  return new TrainingHistory(...args);
}

export type { TrainingHistory };
