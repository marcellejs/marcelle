import type { DataStore } from '../data-store';
import type { Instance } from '../types';
import { Dataset } from './dataset';

export function dataset<T extends Instance>(name: string, store?: DataStore): Dataset<T> {
  return new Dataset(name, store);
}

export function isDataset<T extends Instance>(x: unknown): x is Dataset<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof x === 'object' && x !== null && (x as any).isDataset;
}

export * from './dataset';
