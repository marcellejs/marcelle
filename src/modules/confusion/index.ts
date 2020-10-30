import { Confusion, ConfusionMatrix } from './confusion.module';
import type { BatchPrediction } from '../batch-prediction';

export function confusion(prediction: BatchPrediction): Confusion {
  return new Confusion(prediction);
}

export type { Confusion, ConfusionMatrix };
