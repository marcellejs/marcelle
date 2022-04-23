import type { Dataset, Instance } from '../../core';
import { DatasetTable } from './dataset-table.component';

export function datasetTable<T extends Instance>(
  dataset: Dataset<T>,
  columns?: string[],
): DatasetTable<T> {
  return new DatasetTable(dataset, columns);
}

export type { DatasetTable };
