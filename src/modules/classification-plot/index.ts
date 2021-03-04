import type { Stream } from '../../core/stream';
import type { Prediction } from '../../core/types';
import { ClassificationPlot } from './classification-plot.module';

export function classificationPlot(predictionStream: Stream<Prediction>): ClassificationPlot {
  return new ClassificationPlot(predictionStream);
}

export type { ClassificationPlot };
