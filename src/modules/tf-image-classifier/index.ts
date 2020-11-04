import { TfImageClassifier } from './tfImageClassifier.module';

export function tfImageClassifier(): TfImageClassifier {
  return new TfImageClassifier();
}

export type { TfImageClassifier };
