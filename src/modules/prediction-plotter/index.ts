import type { Stream } from '../../core/stream';
import type { Prediction } from '../../core/types';
import { PredictionPlotter } from './prediction-plotter.module';

export function predictionPlotter(predictionStream: Stream<Prediction>): PredictionPlotter {
  return new PredictionPlotter(predictionStream);
}

export type { PredictionPlotter };
