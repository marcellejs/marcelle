import { Account } from './account.component';
import type { DataStore } from '../../data-store';

export function account(dataStore: DataStore): Account {
  return new Account(dataStore);
}

export type { Account };
