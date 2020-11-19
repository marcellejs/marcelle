import { DataStore, DataStoreOptions } from './data-store';

export function dataStore({ location = 'memory' }: DataStoreOptions = {}): DataStore {
  return new DataStore({ location });
}

export type { DataStore };
