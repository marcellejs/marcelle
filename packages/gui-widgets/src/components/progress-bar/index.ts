import { ProgressBar } from './progress-bar.component';
import { TrainingProgress } from './training-progress.component';
import { PredictionProgress } from './prediction-progress.component';

export function progressBar(...args: ConstructorParameters<typeof ProgressBar>): ProgressBar {
  return new ProgressBar(...args);
}

export function trainingProgress(
  ...args: ConstructorParameters<typeof TrainingProgress>
): TrainingProgress {
  return new TrainingProgress(...args);
}

export function predictionProgress(
  ...args: ConstructorParameters<typeof PredictionProgress>
): PredictionProgress {
  return new PredictionProgress(...args);
}

export * from './progress-bar.component';
export * from './training-progress.component';
export * from './prediction-progress.component';
