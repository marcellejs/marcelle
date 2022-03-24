import type { Dataset } from '../../core';
import { DatasetTable } from './dataset-table.component';

export function datasetTable<InputType, OutputType>(
  dataset: Dataset<InputType, OutputType>,
  columns?: string[],
): DatasetTable<InputType, OutputType> {
  return new DatasetTable(dataset, columns);
}

export type { DatasetTable };
