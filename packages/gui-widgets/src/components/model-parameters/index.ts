import type { ParamConfig } from './model-parameters.component';
import { ModelParameters } from './model-parameters.component';
import type { Parametrable } from '@marcellejs/core';

export function modelParameters(m: Parametrable, config: ParamConfig = {}): ModelParameters {
  if (!m.parameters) {
    throw new Error('The argument is not a valid component with parameters');
  }
  return new ModelParameters(m, config);
}

export * from './model-parameters.component';
