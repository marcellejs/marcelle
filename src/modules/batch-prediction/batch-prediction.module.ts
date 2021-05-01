import { map } from '@most/core';
import { Service, Paginated } from '@feathersjs/feathers';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import type { Prediction, ObjectId, Instance } from '../../core/types';
import { DataStore } from '../../data-store/data-store';
import {
  addScope,
  limitToScope,
  imageData2DataURL,
  dataURL2ImageData,
} from '../../data-store/hooks';
import { Dataset, isDataset } from '../../dataset';
import { logger, Model } from '../../core';
import { readJSONFile, saveBlob } from '../../utils/file-io';
import { throwError } from '../../utils/error-handling';
import { ServiceIterable } from '../../data-store/service-iterable';

export interface BatchPredictionOptions {
  name: string;
  dataStore?: DataStore;
}

export class BatchPrediction extends Module {
  title = 'batch prediction';

  #dataStore: DataStore;
  predictionService: Service<Prediction>;

  $predictions: Stream<ObjectId[]> = new Stream([], true);
  $count: Stream<number>;

  constructor({ name, dataStore }: BatchPredictionOptions) {
    super();
    this.title = name;
    this.#dataStore = dataStore || new DataStore();
    this.$count = new Stream(
      map((x) => x.length, this.$predictions),
      true,
    );
    this.start();
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
    const serviceName = `predictions-${this.title}`;
    this.predictionService = this.#dataStore.service(serviceName) as Service<Prediction>;
    this.predictionService.hooks({
      before: {
        create: [addScope('predictionName', this.title), imageData2DataURL].filter((x) => !!x),
        find: [limitToScope('predictionName', this.title)],
        get: [limitToScope('predictionName', this.title)],
        update: [limitToScope('predictionName', this.title)],
        patch: [limitToScope('predictionName', this.title)],
        remove: [limitToScope('predictionName', this.title)],
      },
      after: {
        find: [dataURL2ImageData].filter((x) => !!x),
        get: [dataURL2ImageData].filter((x) => !!x),
      },
    });

    const result = await this.predictionService.find({
      query: { $select: ['id', 'label'] },
    });
    const { data } = result as Paginated<Prediction>;
    this.$predictions.set(data.map((x) => x.id));
  }

  async predict<T, U>(
    model: Model<T, U>,
    dataset: Dataset<T, string> | ServiceIterable<Instance<T, string>>,
  ): Promise<void> {
    const ds = isDataset(dataset) ? dataset.items() : dataset;
    const predictionIds = [];
    for await (const { id, x, y } of ds) {
      const prediction = await model.predict(x);
      const { id: predId } = await this.predictionService.create(
        { ...prediction, instanceId: id, trueLabel: y },
        { query: { $select: ['id'] } },
      );
      predictionIds.push(predId);
      this.$predictions.set(predictionIds);
    }
  }

  async clear(): Promise<void> {
    const result = await this.predictionService.find({ query: { $select: ['id'] } });
    const { data } = result as Paginated<Prediction>;
    await Promise.all(data.map(({ id }) => this.predictionService.remove(id)));
    this.$predictions.set([]);
  }

  mount(): void {
    // Nothing to show
  }

  async download(): Promise<void> {
    const predictions = await this.predictionService.find();
    const fileContents = {
      marcelleMeta: {
        type: 'predictions',
      },
      predictions: (predictions as Paginated<Prediction>).data,
    };
    const today = new Date(Date.now());
    const fileName = `${this.title}-${today.toISOString()}.json`;
    await saveBlob(JSON.stringify(fileContents), fileName, 'text/plain');
  }

  // eslint-disable-next-line class-methods-use-this
  async upload(files: File[]): Promise<void> {
    const jsonFiles = await Promise.all(
      files.filter((f) => f.type === 'application/json').map((f) => readJSONFile(f)),
    );
    const preds = await Promise.all(
      jsonFiles.map((fileContent: { predictions: Prediction[] }) =>
        Promise.all(
          fileContent.predictions.map((prediction: Prediction) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...predictionNoId } = prediction;
            return this.predictionService
              .create(predictionNoId, { query: { $select: ['id'] } })
              .catch((e) => {
                throwError(e);
              });
          }),
        ),
      ),
    );
    this.$predictions.set(preds.flat().map((x) => (x as Prediction).id));
  }
}
