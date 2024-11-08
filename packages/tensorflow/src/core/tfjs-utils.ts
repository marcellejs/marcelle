import { isDataset, type Dataset, type Instance, type LazyIterable } from '@marcellejs/core';
import type { Dataset as TFDataset } from '@tensorflow/tfjs-data';
import { generator } from '@tensorflow/tfjs-data';

export type { TFDataset };

export function dataset2tfjs<T extends Instance>(
  dataset: Dataset<T> | LazyIterable<T>,
  fields: string[] = null,
  cache = false,
): TFDataset<Partial<T>> {
  const query = fields ? { $select: fields } : {};
  const ds = isDataset(dataset) ? dataset.items().query(query) : dataset;

  const dataSource = cache ? ds.toArray() : Promise.resolve(ds);
  async function* dataGenerator() {
    const instances = await dataSource;
    for await (const instance of instances) {
      yield instance as T;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return generator<Partial<T>>(dataGenerator as any);
}
