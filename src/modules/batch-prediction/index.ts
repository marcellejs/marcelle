import { BatchPrediction, BatchPredictionOptions } from './batch-prediction.module';

export function batchPrediction(options: BatchPredictionOptions): BatchPrediction {
  return new BatchPrediction(options);
}

export type { BatchPrediction, BatchPredictionOptions };
