import { ConfusionMatrix } from './confusion-matrix.component';

export function confusionMatrix(
  ...args: ConstructorParameters<typeof ConfusionMatrix>
): ConfusionMatrix {
  return new ConfusionMatrix(...args);
}

export * from './confusion-matrix.component';
