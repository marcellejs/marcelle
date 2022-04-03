import { Umap } from './umap.component';

export function umap(dataset, supervised) {
  return new Umap(dataset, supervised);
}
