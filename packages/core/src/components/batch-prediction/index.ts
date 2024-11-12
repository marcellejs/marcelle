import { BatchPrediction } from './batch-prediction.component';

export function batchPrediction(
  ...args: ConstructorParameters<typeof BatchPrediction>
): BatchPrediction {
  return new BatchPrediction(...args);
}

export * from './batch-prediction.component';
