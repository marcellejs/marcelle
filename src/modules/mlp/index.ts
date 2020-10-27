import { MLP } from './mlp.module';
import type { MLPOptions } from './mlp.module';

export function mlp(options: Partial<MLPOptions>): MLP {
  return new MLP(options);
}

export type { MLPOptions, MLP };
