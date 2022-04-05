import type { Dataset as TFJSDataset } from '@tensorflow/tfjs-data';
import { generator } from '@tensorflow/tfjs-data';
import type { ServiceIterable } from '../data-store/service-iterable';
import type { Dataset } from '../dataset';
import { isDataset } from '../dataset';
import type { Instance } from '../types';

export function dataset2tfjs<InputType, OutputType>(
  dataset: Dataset<InputType, OutputType> | ServiceIterable<Instance<InputType, OutputType>>,
  fields: string[] = null,
  cache = false,
): TFJSDataset<Partial<Instance<InputType, OutputType>>> {
  const query = fields ? { $select: fields } : {};
  const ds = isDataset(dataset) ? dataset.items().query(query) : dataset;

  const dataSource = cache ? ds.toArray() : Promise.resolve(ds);
  async function* dataGenerator() {
    const instances = await dataSource;
    for await (const instance of instances) {
      yield instance as Instance<InputType, OutputType>;
    }
  }

  return generator<Partial<Instance<InputType, OutputType>>>(dataGenerator as any);
}
