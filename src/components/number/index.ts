import { Number as NumberComponent } from './number.component';

export function number(defaultValue?: number): NumberComponent {
  return new NumberComponent(defaultValue);
}

export type { NumberComponent as Number };
