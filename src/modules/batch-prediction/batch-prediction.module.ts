import { map } from '@most/core';
import { Service, Paginated } from '@feathersjs/feathers';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import type { Instance, Prediction, ObjectId } from '../../core/types';
import { DataStore } from '../../data-store/data-store';
import {
  addScope,
  limitToScope,
  imageData2DataURL,
  dataURL2ImageData,
} from '../../data-store/hooks';
import { Dataset } from '../dataset';
import { MLP } from '../mlp';
import { logger } from '../../core';

export interface BatchPredictionOptions {
  name: string;
  dataStore?: DataStore;
}

export class BatchPrediction extends Module {
  name = 'batch prediction';
  description = 'BatchPrediction';

  #dataStore: DataStore;
  predictionService: Service<Prediction>;

  $predictions: Stream<ObjectId[]> = new Stream([], true);
  $count: Stream<number>;

  constructor({ name, dataStore }: BatchPredictionOptions) {
    super();
    this.name = name;
    this.#dataStore = dataStore || new DataStore();
    this.#dataStore
      .connect()
      .then(() => {
        this.setup();
      })
      .catch(() => {
        logger.log('[BatchPrediction] data store connection failed');
      });
  }

  async setup(): Promise<void> {
    const serviceName = `predictions-${this.name}`;
    this.#dataStore.createService(serviceName);
    this.predictionService = this.#dataStore.service(serviceName) as Service<Prediction>;
    this.predictionService.hooks({
      before: {
        create: [addScope('predictionName', this.name), imageData2DataURL].filter((x) => !!x),
        find: [limitToScope('predictionName', this.name)],
        get: [limitToScope('predictionName', this.name)],
        update: [limitToScope('predictionName', this.name)],
        patch: [limitToScope('predictionName', this.name)],
        remove: [limitToScope('predictionName', this.name)],
      },
      after: {
        find: [dataURL2ImageData].filter((x) => !!x),
        get: [dataURL2ImageData].filter((x) => !!x),
      },
    });

    this.$count = new Stream(
      map((x) => x.length, this.$predictions),
      true,
    );
    this.start();
    const result = await this.predictionService.find({
      query: { $select: ['id', '_id', 'label'] },
    });
    const { data } = result as Paginated<Prediction>;
    this.$predictions.set(data.map((x) => x.id));
  }

  async predict(model: MLP, dataset: Dataset, inputField = 'features'): Promise<void> {
    const result = await dataset.instanceService.find({
      query: { $select: ['id', inputField, 'label'] },
    });
    const { data } = result as Paginated<Instance>;
    const predictionIds = await Promise.all(
      data.map(({ id, [inputField]: features, label }) =>
        model
          .predict(features)
          .then((prediction) =>
            this.predictionService.create(
              { ...prediction, instanceId: id, trueLabel: label },
              { query: { $select: ['id'] } },
            ),
          ),
      ),
    );
    this.$predictions.set(predictionIds.map((x) => x.id));
  }

  async clear(): Promise<void> {
    const result = await this.predictionService.find({ query: { $select: ['id'] } });
    const { data } = result as Paginated<Prediction>;
    await Promise.all(data.map(({ id }) => this.predictionService.remove(id)));
  }

  // eslint-disable-next-line class-methods-use-this
  mount(): void {}
}
