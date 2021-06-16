import { Account } from './account.component';
import type { DataStore } from '../../core/data-store';

export function account(dataStore: DataStore): Account {
  return new Account(dataStore);
}

export type { Account };
