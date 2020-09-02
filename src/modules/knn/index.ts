import { KNN } from './knn.module';
import type { KNNParameters, KNNOptions, KNNResults } from './knn.module';

export function knn(options: Partial<KNNOptions>): KNN {
  return new KNN(options);
}

export type { KNNParameters, KNNOptions, KNNResults, KNN };
