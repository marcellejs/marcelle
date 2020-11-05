import { TfImageClassifier } from './tf-image-classifier.module';

export function tfImageClassifier(): TfImageClassifier {
  return new TfImageClassifier();
}

export type { TfImageClassifier };
