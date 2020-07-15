import { Button, ButtonOptions } from './button.module';

export function button(options: ButtonOptions): Button {
  return new Button(options);
}
