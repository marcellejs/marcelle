import { Toggle, ToggleOptions } from './toggle.module';

export function toggle(options: Partial<ToggleOptions>): Toggle {
  return new Toggle(options);
}
