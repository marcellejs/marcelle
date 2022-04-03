import { Toggle } from './toggle.component';

export function toggle(text?: string): Toggle {
  return new Toggle(text);
}

export type { Toggle };
