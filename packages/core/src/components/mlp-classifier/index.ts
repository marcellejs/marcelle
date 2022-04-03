import { MLPClassifier } from './mlp-classifier.component';
import type { MLPClassifierOptions } from './mlp-classifier.component';

export function mlpClassifier(options: Partial<MLPClassifierOptions>): MLPClassifier {
  return new MLPClassifier(options);
}

export type { MLPClassifierOptions, MLPClassifier };
