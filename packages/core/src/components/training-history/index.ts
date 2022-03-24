import type { DataStore } from '../../core/data-store';
import { TrainingHistory, TrainingHistoryOptions } from './training-history.component';

export function trainingHistory<InputType, OutputType>(
  dataStore: DataStore,
  options: TrainingHistoryOptions,
): TrainingHistory<InputType, OutputType> {
  return new TrainingHistory(dataStore, options);
}

export type { TrainingHistory };
