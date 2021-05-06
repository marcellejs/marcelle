import { ModelParameters } from './model-parameters.module';
import type { Parametrable } from '../../core/types';

export function modelParameters(m: Parametrable): ModelParameters {
  if (!m.parameters) {
    throw new Error('The argument is not a valid module with parameters');
  }
  return new ModelParameters(m);
}

export type { ModelParameters };
