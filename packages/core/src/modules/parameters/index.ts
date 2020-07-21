import { Parameters, Parametrable } from './parameters.module';

export function parameters(m: Parametrable): Parameters {
  if (!m.parameters) {
    throw new Error('The argument is not a valid module with parameters');
  }
  return new Parameters(m);
}
