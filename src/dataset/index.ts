import { DataStore } from '../data-store';
import { Dataset } from './dataset';

export function dataset<InputType, OutputType>(
  name: string,
  store?: DataStore,
): Dataset<InputType, OutputType> {
  return new Dataset(name, store);
}

export type { Dataset };
