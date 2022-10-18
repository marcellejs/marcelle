import { Number as NumberComponent } from './number.component';

export function number(...args: ConstructorParameters<typeof NumberComponent>): NumberComponent {
  return new NumberComponent(...args);
}

export type { NumberComponent as Number };
