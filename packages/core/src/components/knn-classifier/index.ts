import { KNNClassifier } from './knn-classifier.component';

export function knnClassifier(...args: ConstructorParameters<typeof KNNClassifier>): KNNClassifier {
  return new KNNClassifier(...args);
}

export type { KNNClassifier };
