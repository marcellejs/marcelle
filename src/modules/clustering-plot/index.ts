import { ClusteringPlot } from './clustering-plot.module';
import { Dataset } from '../dataset';

export function clusteringPlot(dataset: Dataset): ClusteringPlot {
  return new ClusteringPlot(dataset);
}

export type { ClusteringPlot };
