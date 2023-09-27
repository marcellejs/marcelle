import type { Prediction, Instance, Service } from '../../core/types';
import type { Paginated } from '@feathersjs/feathers';
import type { ServiceIterable } from '../../core/data-store/service-iterable';
import { Component } from '../../core/component';
import { DataStore } from '../../core/data-store/data-store';
import { Dataset, isDataset } from '../../core/dataset';
import { dataStore, Model } from '../../core';
import { toKebabCase } from '../../utils/string';
import { LazyIterable, throwError } from '../../utils';
import { BehaviorSubject } from 'rxjs';

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

  $status = new BehaviorSubject<BatchPredictionStatus>({ status: 'loading' });

  constructor(name: string, store = dataStore()) {
    super();
    this.name = name;
    this.title = `batch prediction (${name})`;
    this.#store = store || new DataStore();

    this.#store
      .connect()
      .then(() => {
        this.setup();
      })
      .catch((e) => {
        const err = new Error(e?.message);
        err.name = `Batch Prediction Error (${name}): Datastore connection failed`;
        throwError(err, { duration: 0 });
      });
  }

  async setup(): Promise<void> {
    const serviceName = toKebabCase(`predictions-${this.name}`);
    this.predictionService = this.#store.service(serviceName) as Service<Prediction>;

    const { total } = (await this.predictionService.find({
      query: { $limit: 1, $select: ['id'] },
    })) as Paginated<Prediction>;
    this.$status.next({ status: total > 0 ? 'loaded' : 'idle' });
  }

  async predict<T extends Instance, PredictionType>(
    model: Model<T, PredictionType>,
    dataset: Dataset<T> | LazyIterable<T>,
  ): Promise<void> {
    try {
      const total = isDataset(dataset) ? dataset.$count.value : (await dataset.toArray()).length;
      this.$status.next({ status: 'start' });
      const ds = isDataset(dataset) ? dataset.items() : dataset;
      let i = 0;
      for await (const { id, x, y } of ds) {
        const prediction = await model.predict(x);
        const storedPrediction = await this.predictionService.create({
          ...prediction,
          instanceId: id,
          yTrue: y,
        });
        this.$status.next({
          status: 'running',
          count: ++i,
          total,
          data: storedPrediction as Prediction,
        });
      }
      this.$status.next({ status: 'success', count: i, total });
    } catch (error) {
      this.$status.next({ status: 'error', data: { error } });
    }
  }

  async clear(): Promise<void> {
    await this.predictionService.remove(null, { query: {} });
  }

  items(): ServiceIterable<Prediction> {
    return this.predictionService.items();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  mount(): void {}
}
