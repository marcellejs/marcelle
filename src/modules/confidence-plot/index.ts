import type { Stream } from '../../core/stream';
import type { Prediction } from '../../core/types';
import { ConfidencePlot } from './confidence-plot.module';

export function confidencePlot(predictionStream: Stream<Prediction>): ConfidencePlot {
  return new ConfidencePlot(predictionStream);
}

export type { ConfidencePlot };
