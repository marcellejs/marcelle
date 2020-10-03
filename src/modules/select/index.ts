import { Select, SelectOptions } from './select.module';

export function select(options: Partial<SelectOptions>): Select {
  return new Select(options);
}

export type { Select, SelectOptions };
