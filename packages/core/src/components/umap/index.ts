import { Umap } from './umap.component';

export function umap(...args: ConstructorParameters<typeof Umap>): Umap {
  return new Umap(...args);
}

export * from './umap.component';
