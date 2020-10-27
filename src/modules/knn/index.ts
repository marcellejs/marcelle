import { KNN, KNNOptions } from './knn.module';

export function knn(options: Partial<KNNOptions>): KNN {
  return new KNN(options);
}

export type { KNNOptions, KNN };
