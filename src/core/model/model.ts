/* eslint-disable no-underscore-dangle */
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

  protected syncModelName: string;

  ready = false;

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
    id?: ObjectId,
  ): Promise<ObjectId | null>;
  abstract load(idOrName: ObjectId | string): Promise<StoredModel>;
  abstract download(metadata?: Record<string, unknown>): Promise<void>;
  abstract upload(...files: File[]): Promise<StoredModel>;

  get service(): Service<StoredModel> {
    return this.dataStore?.service(this.serviceName) as Service<StoredModel>;
  }

  @checkProperty('dataStore')
  sync(name: string): this {
    this.syncModelName = name;
    this.dataStore.connect().then(() => {
      this.setupSync();
    });
    return this;
  }

  protected async setupSync(): Promise<void> {
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
    let id: ObjectId = null;
    if (data.length === 1) {
      id = data[0].id;
      this.load(id);
    }
    let skipNextUpdate = false;
    this.$training.subscribe(({ status, data: meta }) => {
      if (status === 'success' || (status === 'loaded' && meta?.source !== 'datastore')) {
        skipNextUpdate = true;
        this.save(this.syncModelName, {}, id).then((newId) => {
          id = newId;
        });
      }
    });
    const cb = (s: StoredModel & { _id: ObjectId }) => {
      if (s._id === id || (!id && s.name === this.syncModelName)) {
        id = s._id;
        if (!skipNextUpdate) {
          this.load(id);
        }
        skipNextUpdate = false;
      }
    };
    this.service.on('created', cb);
    this.service.on('updated', cb);
    this.service.on('patched', cb);
  }

  @checkProperty('dataStore')
  protected async saveToDatastore(model: StoredModel, id: ObjectId = null): Promise<ObjectId> {
    if (!this.service) return null;
    if (!model) return null;
    let newId = id;
    if (id) {
      await this.service.update(id, model);
    } else {
      const res = await this.service.create(model);
      newId = res.id;
    }
    const name = this.syncModelName || toKebabCase(this.title);
    logger.info(`Model ${name} was saved to data store at location ${this.dataStore.location}`);
    return newId;
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

  mount(): void {
    // Nothing to show
  }
}
