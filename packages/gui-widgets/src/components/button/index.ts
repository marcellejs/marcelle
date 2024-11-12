import { Button } from './button.component';

export function button(...args: ConstructorParameters<typeof Button>): Button {
  return new Button(...args);
}

export * from './button.component';
