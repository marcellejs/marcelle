import { PCA } from './pca.component';

export function pca(...args: ConstructorParameters<typeof PCA>): PCA {
  return new PCA(...args);
}

export type { PCA };
