import { Button, ButtonOptions } from './button.module';

export function button(options: Partial<ButtonOptions>): Button {
  return new Button(options);
}
