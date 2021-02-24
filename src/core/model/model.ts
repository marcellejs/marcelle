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
  service: Service<StoredModel>;
  #storedModelId: string;
  protected syncModelName: string;

  constructor({ dataStore }: Partial<ModelOptions> = {}) {
    super();
    this.dataStore = dataStore;
    this.$training.start();
  }

  abstract train(dataset: Dataset): void;
  abstract predict(x: InputType): Promise<OutputType>;

  abstract save(update: boolean, metadata?: Record<string, unknown>): Promise<ObjectId | null>;
  abstract load(id?: ObjectId): Promise<StoredModel>;
  abstract download(metadata?: Record<string, unknown>): Promise<void>;
  abstract upload(...files: File[]): Promise<StoredModel>;

  @checkProperty('dataStore')
  sync(name: string) {
    this.syncModelName = name;
    this.dataStore.connect().then(() => {
      this.setupSync();
    });
    return this;
  }

  protected async setupSync() {
    this.service = this.dataStore.service(this.serviceName) as Service<StoredModel>;
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
      this.#storedModelId = data[0].id;
      this.load().catch(() => {});
    }
    this.$training.subscribe(({ status, data: meta }) => {
      if (status === 'success' || (status === 'loaded' && meta?.source !== 'datastore')) {
        this.save(true);
      }
    });
  }

  @checkProperty('dataStore')
  protected async saveToDatastore(model: StoredModel, update = true): Promise<ObjectId> {
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
  protected async loadFromDatastore(id?: ObjectId): Promise<StoredModel> {
    if (!this.service || (!id && !this.#storedModelId)) return null;
    const model = await this.service.get(id || this.#storedModelId);
    if (model) {
      const name = this.syncModelName || toKebabCase(this.title);
      logger.info(
        `Model ${name} was loaded from data store at location ${this.dataStore.location}`,
      );
    }
    return model;
  }

  // eslint-disable-next-line class-methods-use-this
  mount(): void {}
}
