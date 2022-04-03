import { Select } from './select.component';

export function select(...args: ConstructorParameters<typeof Select>): Select {
  return new Select(...args);
}

export type { Select };
