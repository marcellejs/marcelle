import { TrainingProgress } from './training-progress.module';
import { Model } from '../../core';

export function trainingProgress<T, U>(m: Model<T, U>): TrainingProgress<T, U> {
  if (!m.$training) {
    throw new Error('The argument is not a valid MLP');
  }
  return new TrainingProgress(m);
}

export type { TrainingProgress };
