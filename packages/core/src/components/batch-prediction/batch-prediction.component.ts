import type { Prediction, Instance } from '../../core/types';
import type { Paginated, Service } from '@feathersjs/feathers';
import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import { DataStore } from '../../core/data-store/data-store';
import { Dataset, isDataset } from '../../core/dataset';
import { dataStore, logger, Model } from '../../core';
import { iterableFromService, ServiceIterable } from '../../core/data-store/service-iterable';
import { toKebabCase } from '../../utils/string';

export interface BatchPredictionStatus {
  status: 'idle' | 'start' | 'running' | 'success' | 'error' | 'loaded' | 'loading';
  count?: number;
  total?: number;
  data?: Record<string, unknown>;
}

export class BatchPrediction extends Component {
  title = 'batch prediction';
  name: string;

  #store: DataStore;
  predictionService: Service<Prediction>;

  $status = new Stream<BatchPredictionStatus>({ status: 'loading' }, true);

  constructor(name: string, store = dataStore()) {
    super();
    this.name = name;
    this.title = `batch prediction (${name})`;
    this.#store = store || new DataStore();
    this.start();
    this.#store
      .connect()
      .then(() => {
        this.setup();
      })
      .catch((err) => {
        logger.log(`[batchPrediction:${name}] dataStore connection failed`, err);
      });
  }

  async setup(): Promise<void> {
    const serviceName = toKebabCase(`predictions-${this.name}`);
    this.predictionService = this.#store.service(serviceName) as Service<Prediction>;

    const { total } = (await this.predictionService.find({
      query: { $limit: 1, $select: ['id'] },
    })) as Paginated<Prediction>;
    this.$status.set({ status: total > 0 ? 'loaded' : 'idle' });
  }

  async predict<T, U>(
    model: Model<T, U>,
    dataset: Dataset<T, string> | ServiceIterable<Instance<T, string>>,
  ): Promise<void> {
    try {
      const total = isDataset(dataset) ? dataset.$count.value : (await dataset.toArray()).length;
      this.$status.set({ status: 'start' });
      const ds = isDataset(dataset) ? dataset.items() : dataset;
      let i = 0;
      for await (const { id, x, y } of ds) {
        const prediction = await model.predict(x);
        const storedPrediction = await this.predictionService.create({
          ...prediction,
          instanceId: id,
          yTrue: y,
        });
        this.$status.set({ status: 'running', count: ++i, total, data: storedPrediction });
      }
      this.$status.set({ status: 'success', count: i, total });
    } catch (error) {
      this.$status.set({ status: 'error', data: { error } });
    }
  }

  async clear(): Promise<void> {
    await this.predictionService.remove(null, { query: {} });
  }

  items(): ServiceIterable<Prediction> {
    return iterableFromService(this.predictionService);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  mount(): void {}
}
