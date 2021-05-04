import { DataStore } from './data-store';

export function dataStore(location?: string): DataStore {
  return new DataStore(location);
}

export type { DataStore };
