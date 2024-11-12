import type { Instance } from '../../core';
import { DatasetScatter } from './dataset-scatter.component';

export function datasetScatter<T extends Instance>(
  ...args: ConstructorParameters<typeof DatasetScatter<T>>
): DatasetScatter<T> {
  return new DatasetScatter<T>(...args);
}

export * from './dataset-scatter.component';
