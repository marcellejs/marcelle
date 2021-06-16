import { BatchPrediction, BatchPredictionOptions } from './batch-prediction.component';

export function batchPrediction(options: BatchPredictionOptions): BatchPrediction {
  return new BatchPrediction(options);
}

export type { BatchPrediction, BatchPredictionOptions };
