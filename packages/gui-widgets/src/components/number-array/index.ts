import { NumberArray } from './number-array.component';

export function numberArray(...args: ConstructorParameters<typeof NumberArray>): NumberArray {
  return new NumberArray(...args);
}

export type { NumberArray };
