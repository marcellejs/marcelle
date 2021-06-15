import { Toggle, ToggleOptions } from './toggle.component';

export function toggle(options: Partial<ToggleOptions>): Toggle {
  return new Toggle(options);
}
