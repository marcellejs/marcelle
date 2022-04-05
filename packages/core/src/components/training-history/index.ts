import { TrainingHistory } from './training-history.component';

export function trainingHistory<InputType, OutputType, PredictionType>(
  ...args: ConstructorParameters<typeof TrainingHistory>
): TrainingHistory<InputType, OutputType, PredictionType> {
  return new TrainingHistory(...args);
}

export type { TrainingHistory };
