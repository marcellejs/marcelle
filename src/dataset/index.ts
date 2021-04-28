import { DataStore } from '../data-store';
import { Dataset } from './dataset';

export function dataset(name: string, store?: DataStore): Dataset {
  return new Dataset(name, store);
}

export type { Dataset };
