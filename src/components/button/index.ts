import { Button, ButtonOptions } from './button.component';

export function button(options: Partial<ButtonOptions>): Button {
  return new Button(options);
}

export type { Button, ButtonOptions };
