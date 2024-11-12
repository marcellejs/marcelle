import { Account } from './account.component';

export function account(...args: ConstructorParameters<typeof Account>): Account {
  return new Account(...args);
}

export * from './account.component';
