import { Button } from './button.component';

export function button(text?: string): Button {
  return new Button(text);
}

export type { Button };
