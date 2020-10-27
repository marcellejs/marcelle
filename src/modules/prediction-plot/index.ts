import type { Stream } from '../../core/stream';
import type { Prediction } from '../../core/types';
import { PredictionPlot } from './prediction-plot.module';

export function predictionPlot(predictionStream: Stream<Prediction>): PredictionPlot {
  return new PredictionPlot(predictionStream);
}

export type { PredictionPlot };
