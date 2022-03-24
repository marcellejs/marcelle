import type { DataStore } from '../data-store';
import { Dataset } from './dataset';

export function dataset<InputType, OutputType>(
  name: string,
  store?: DataStore,
): Dataset<InputType, OutputType> {
  return new Dataset(name, store);
}

export function isDataset(x: unknown): x is Dataset<unknown, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof x === 'object' && x !== null && (x as any).isDataset;
}

export type { Dataset };
