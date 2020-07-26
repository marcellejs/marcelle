import { Dataset, DatasetOptions } from './dataset.module';
import type { BaseBackend } from './base.backend';

export function dataset(options: DatasetOptions): Dataset {
  return new Dataset(options);
}

export type { Dataset, DatasetOptions, BaseBackend };
