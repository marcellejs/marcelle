import { MLP } from './mlp.module';
import type { MLPParameters, MLPOptions, MLPResults } from './mlp.module';

export function mlp(options: Partial<MLPOptions>): MLP {
  return new MLP(options);
}

export type { MLPParameters, MLPOptions, MLPResults, MLP };
