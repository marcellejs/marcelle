import { Button } from './button.module';

export function button(options: Record<string, unknown>): Button {
  return new Button(options);
}
