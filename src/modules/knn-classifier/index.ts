import { KNNClassifier, KNNClassifierOptions } from './knn-classifier.module';

export function knnClassifier(options: Partial<KNNClassifierOptions>): KNNClassifier {
  return new KNNClassifier(options);
}

export type { KNNClassifierOptions, KNNClassifier };
