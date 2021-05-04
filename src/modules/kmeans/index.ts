import { KMeans, KMeansOptions } from './kmeans.module';

export function kmeans(options: Partial<KMeansOptions>): KMeans {
  return new KMeans(options);
}

export type { KMeansOptions, KMeans };
