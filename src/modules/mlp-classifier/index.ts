import { MLPClassifier } from './mlp-classifier.module';
import type { MLPClassifierOptions } from './mlp-classifier.module';

export function mlpClassifier(options: Partial<MLPClassifierOptions>): MLPClassifier {
  return new MLPClassifier(options);
}

export type { MLPClassifierOptions, MLPClassifier };
