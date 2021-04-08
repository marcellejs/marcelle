import { Paginated, Service } from '@feathersjs/feathers';
import type { Dataset } from '../../modules/dataset';
import type { ObjectId, Parametrable, StoredModel, TrainingStatus } from '../types';
import { Stream } from '../stream';
import { DataStore } from '../../data-store';
import { checkProperty } from '../../utils/error-handling';
import { Module } from '../module';
import { logger } from '../logger';
import { toKebabCase } from '../../utils/string';

export interface ModelOptions {
  dataStore: DataStore;
}

export abstract class Model<InputType, OutputType> extends Module implements Parametrable {
  abstract parameters: Parametrable['parameters'];
  abstract serviceName: string;

  $training = new Stream<TrainingStatus>({ status: 'idle' }, true);

  dataStore?: DataStore;

  #storedModelId: string;
  protected syncModelName: string;

  ready: boolean = false;

  constructor({ dataStore }: Partial<ModelOptions> = {}) {
    super();
    this.dataStore = dataStore;
    this.$training.start();
    this.$training.subscribe(({ status }) => {
      if (status === 'success' || status === 'loaded') {
        this.ready = true;
      }
    });
  }

  abstract train(dataset: Dataset): void;
  abstract predict(x: InputType): Promise<OutputType>;

  abstract save(
    name: string,
    metadata?: Record<string, unknown>,
    update?: boolean,
  ): Promise<ObjectId | null>;
  abstract load(idOrName: ObjectId | string): Promise<StoredModel>;
  abstract download(metadata?: Record<string, unknown>): Promise<void>;
  abstract upload(...files: File[]): Promise<StoredModel>;

  get service(): Service<StoredModel> {
    return this.dataStore?.service(this.serviceName) as Service<StoredModel>;
  }

  @checkProperty('dataStore')
  sync(name: string) {
    this.syncModelName = name;
    this.dataStore.connect().then(() => {
      this.setupSync();
    });
    return this;
  }

  protected async setupSync() {
    if (!this.service) return;
    const { data } = (await this.service.find({
      query: {
        name: this.syncModelName,
        $select: ['id'],
        $limit: 1,
        $sort: {
          updatedAt: -1,
        },
      },
    })) as Paginated<StoredModel>;
    if (data.length === 1) {
      this.load(data[0].id);
    }
    this.$training.subscribe(({ status, data: meta }) => {
      if (status === 'success' || (status === 'loaded' && meta?.source !== 'datastore')) {
        this.save(this.syncModelName, {}, true);
      }
    });
  }

  @checkProperty('dataStore')
  protected async saveToDatastore(model: StoredModel, update = false): Promise<ObjectId> {
    if (!this.service) return null;
    if (!model) return null;
    if (update && this.#storedModelId) {
      await this.service.update(this.#storedModelId, model);
    } else {
      const res = await this.service.create(model);
      this.#storedModelId = res.id;
    }
    const name = this.syncModelName || toKebabCase(this.title);
    logger.info(`Model ${name} was saved to data store at location ${this.dataStore.location}`);
    return this.#storedModelId;
  }

  @checkProperty('dataStore')
  protected async loadFromDatastore(idOrName: ObjectId | string): Promise<StoredModel> {
    if (!this.service || !idOrName) return null;
    let model;
    try {
      model = await this.service.get(idOrName);
    } catch (error) {
      const { data } = (await this.service.find({
        query: {
          name: idOrName,
          $limit: 1,
          $sort: {
            updatedAt: -1,
          },
        },
      })) as Paginated<StoredModel>;
      if (data.length === 1) {
        model = data[0];
      }
    }
    if (model) {
      const name = model.name;
      logger.info(
        `Model ${name} was loaded from data store at location ${this.dataStore.location}`,
      );
    }
    return model;
  }

  // eslint-disable-next-line class-methods-use-this
  mount(): void {}
}
