import { kNN } from './knn.module';
import type { kNNParameters, kNNOptions, kNNResults } from './knn.module';

export function knn(options: Partial<kNNOptions>): kNN {
  return new kNN(options);
}

export type { kNNParameters, kNNOptions, kNNResults, kNN };
