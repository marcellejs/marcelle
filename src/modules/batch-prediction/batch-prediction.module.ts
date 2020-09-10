import { map } from '@most/core';
import { Service, Paginated } from '@feathersjs/feathers';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import type { Instance, Prediction, ObjectId } from '../../core/types';
import { Backend, BackendType } from '../../backend/backend';
import { addScope, limitToScope, imageData2DataURL, dataURL2ImageData } from '../../backend/hooks';
import { Dataset } from '../dataset';
import { MLP } from '../mlp';

export interface BatchPredictionOptions {
  name: string;
  backend?: Backend;
}

export class BatchPrediction extends Module {
  name = 'batch prediction';
  description = 'BatchPrediction';

  #backend: Backend;
  predictionService: Service<Prediction>;

  $predictions: Stream<ObjectId[]> = new Stream([], true);
  $count: Stream<number>;

  constructor({ name, backend = new Backend() }: BatchPredictionOptions) {
    super();
    this.name = name;
    this.#backend = backend;
    this.#backend.createService(`prediction-${name}`);
    this.predictionService = this.#backend.service(`prediction-${name}`) as Service<Prediction>;
    this.predictionService.hooks({
      before: {
        create: [
          addScope('predictionName', this.name),
          this.#backend.backendType === BackendType.Memory && imageData2DataURL,
        ].filter((x) => !!x),
        find: [limitToScope('predictionName', this.name)],
        get: [limitToScope('predictionName', this.name)],
        update: [limitToScope('predictionName', this.name)],
        patch: [limitToScope('predictionName', this.name)],
        remove: [limitToScope('predictionName', this.name)],
      },
      after: {
        find: [this.#backend.backendType === BackendType.Memory && dataURL2ImageData].filter(
          (x) => !!x,
        ),
        get: [this.#backend.backendType === BackendType.Memory && dataURL2ImageData].filter(
          (x) => !!x,
        ),
      },
    });

    this.predictionService.find({ query: { $select: ['id', '_id', 'label'] } }).then((result) => {
      const { data } = result as Paginated<Prediction>;
      this.$predictions.set(data.map((x) => x.id));
    });
    this.$count = new Stream(
      map((x) => x.length, this.$predictions),
      true,
    );
    this.start();
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
