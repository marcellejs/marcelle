import { KMeansClustering, KMeansClusteringOptions } from './kmeans-clustering.module';

export function kmeansClustering(options: Partial<KMeansClusteringOptions>): KMeansClustering {
  return new KMeansClustering(options);
}

export type { KMeansClusteringOptions, KMeansClustering };
