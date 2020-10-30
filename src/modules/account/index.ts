import { Account } from './account.module';
import type { Backend } from '../../backend';

export function account(backend: Backend): Account {
  return new Account(backend);
}

export type { Account };
