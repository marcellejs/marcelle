import { MLPClassifier } from './mlp-classifier.component';

export function mlpClassifier(...args: ConstructorParameters<typeof MLPClassifier>): MLPClassifier {
  return new MLPClassifier(...args);
}

export type { MLPClassifier };
