import { Dataset, DatasetOptions } from './dataset.module';

export function dataset(options: DatasetOptions): Dataset {
  return new Dataset(options);
}
