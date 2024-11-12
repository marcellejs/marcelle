import { KMeansClustering } from './kmeans-clustering.component';

export function kmeansClustering(
  ...args: ConstructorParameters<typeof KMeansClustering>
): KMeansClustering {
  return new KMeansClustering(...args);
}

export * from './kmeans-clustering.component';
