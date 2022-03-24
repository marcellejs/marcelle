import { KNNClassifier, KNNClassifierOptions } from './knn-classifier.component';

export function knnClassifier(options: Partial<KNNClassifierOptions>): KNNClassifier {
  return new KNNClassifier(options);
}

export type { KNNClassifierOptions, KNNClassifier };
