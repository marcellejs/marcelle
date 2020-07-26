import { Parameters } from './parameters.module';
import type { Parametrable } from '../../core/types';

export function parameters(m: Parametrable): Parameters {
  if (!m.parameters) {
    throw new Error('The argument is not a valid module with parameters');
  }
  return new Parameters(m);
}

export type { Parameters };
