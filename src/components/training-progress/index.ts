import type { Model } from '../../core';
import { TrainingProgress } from './training-progress.component';

export function trainingProgress<T, U>(m: Model<T, U>): TrainingProgress<T, U> {
  if (!m.$training) {
    throw new Error('The argument is not a valid MLP');
  }
  return new TrainingProgress(m);
}

export type { TrainingProgress };
