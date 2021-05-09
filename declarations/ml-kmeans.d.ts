declare module 'ml-kmeans' {
  declare const distanceSymbol: unique symbol;

  export class KMeansResult {
    /**
     * Result of the kmeans algorithm
     * @param {Array<number>} clusters - the cluster identifier for each data dot
     * @param {Array<Array<object>>} centroids - the K centers in format [x,y,z,...], the error and size of the cluster
     * @param {boolean} converged - Converge criteria satisfied
     * @param {number} iterations - Current number of iterations
     * @param {function} distance - (*Private*) Distance function to use between the points
     * @constructor
     */
    constructor(
      clusters: Array<number>,
      // eslint-disable-next-line @typescript-eslint/ban-types
      centroids: Array<{ centroid: number[]; error: number; size: number }>,
      converged: boolean,
      iterations: number,
      // eslint-disable-next-line @typescript-eslint/ban-types
      distance: Function,
    );
    clusters: number[];
    centroids: Array<{ centroid: number[]; error: number; size: number }>;
    converged: boolean;
    iterations: number;
    /**
     * Allows to compute for a new array of points their cluster id
     * @param {Array<Array<number>>} data - the [x,y,z,...] points to cluster
     * @return {Array<number>} - cluster id for each point
     */
    nearest(data: Array<Array<number>>): Array<number>;
    /**
     * Returns a KMeansResult with the error and size of the cluster
     * @ignore
     * @param {Array<Array<number>>} data - the [x,y,z,...] points to cluster
     * @return {KMeansResult}
     */
    computeInformation(data: Array<Array<number>>): KMeansResult;
    // eslint-disable-next-line @typescript-eslint/ban-types
    [distanceSymbol]: Function;
  }

  export default function kmeans(
    data: Array<Array<number>>,
    K: number,
    options?: {
      maxIterations?: number;
      tolerance?: number;
      withIterations?: boolean;
      // eslint-disable-next-line @typescript-eslint/ban-types
      distanceFunction?: Function;
      seed?: number;
      initialization?: string | Array<Array<number>>;
    },
  ): KMeansResult;
}
