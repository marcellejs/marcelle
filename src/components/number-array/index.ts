import { NumberArray } from './number-array.component';

export function numberArray(defaultValue?: number[]): NumberArray {
  return new NumberArray(defaultValue);
}

export type { NumberArray };
