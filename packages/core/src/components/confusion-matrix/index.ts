import { ConfusionMatrix, type ConfusionMatrixT } from './confusion-matrix.component';

export function confusionMatrix(
  ...args: ConstructorParameters<typeof ConfusionMatrix>
): ConfusionMatrix {
  return new ConfusionMatrix(...args);
}

export type { ConfusionMatrix, ConfusionMatrixT };
