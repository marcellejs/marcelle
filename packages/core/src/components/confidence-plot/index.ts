import { ConfidencePlot } from './confidence-plot.component';

export function confidencePlot(
  ...args: ConstructorParameters<typeof ConfidencePlot>
): ConfidencePlot {
  return new ConfidencePlot(...args);
}

export type { ConfidencePlot };
