/* eslint-disable no-underscore-dangle */
import type { Paginated } from '@feathersjs/feathers';
import type { Dataset } from '../dataset';
import type {
  Instance,
  ObjectId,
  Parametrable,
  StoredModel,
  TrainingStatus,
  Service,
} from '../types';
import type { DataStore } from '../data-store';
import { Stream } from '../stream';
import { Component } from '../component';
import { logger } from '../logger';
import { LazyIterable, throwError } from '../../utils';

export abstract class Model<T extends Instance, PredictionType>
  extends Component
  implements Parametrable
{
  abstract parameters: Parametrable['parameters'];
  abstract serviceName: string;

  ready = false;

  protected syncData: {
    store: DataStore;
    name: string;
    service?: Service<StoredModel>;
  };

  $training = new Stream<TrainingStatus>({ status: 'idle' }, true);

  constructor() {
    super();
    this.$training.start();
    this.$training.subscribe(({ status }) => {
      if (status === 'success' || status === 'loaded') {
        this.ready = true;
      }
    });
  }

  abstract train(
    dataset: Dataset<T> | LazyIterable<T>,
    validationDataset?: Dataset<T> | LazyIterable<T>,
  ): void;
  abstract predict(x: T['x']): Promise<PredictionType>;

  abstract save(
    store: DataStore,
    name: string,
    metadata?: Record<string, unknown>,
    id?: ObjectId,
  ): Promise<ObjectId | null>;
  abstract load(store: DataStore, idOrName: ObjectId | string): Promise<StoredModel>;
  abstract download(metadata?: Record<string, unknown>): Promise<void>;
  abstract upload(...files: File[]): Promise<StoredModel>;

  sync(store: DataStore, name: string): this {
    this.syncData = { name, store };
    this.syncData.store
      .connect()
      .then(() => {
        this.syncData.service = this.syncData.store.service(
          this.serviceName,
        ) as Service<StoredModel>;
        this.setupSync();
      })
      .catch((e) => {
        const err = new Error(e?.message);
        err.name = `Model Sync Error (${name}): datastore connection failed`;
        throwError(err, { duration: 0 });
      });
    return this;
  }

  protected async setupSync(): Promise<void> {
    if (!this.syncData.service) return;
    const { data } = (await this.syncData.service.find({
      query: {
        name: this.syncData.name,
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
      this.load(this.syncData.store, id);
    }
    let skipNextUpdate = false;
    this.$training.subscribe(({ status, data: meta }) => {
      if (status === 'success' || (status === 'loaded' && meta?.source !== 'datastore')) {
        skipNextUpdate = true;
        this.save(this.syncData.store, this.syncData.name, {}, id).then((newId) => {
          id = newId;
        });
      }
    });
    const cb = (s: StoredModel & { _id: ObjectId }) => {
      if (s._id === id || (!id && s.name === this.syncData.name)) {
        id = s._id;
        if (!skipNextUpdate) {
          this.load(this.syncData.store, id);
        }
        skipNextUpdate = false;
      }
    };
    this.syncData.service.on('created', cb);
    this.syncData.service.on('updated', cb);
    this.syncData.service.on('patched', cb);
  }

  protected async saveToDatastore(
    store: DataStore,
    model: StoredModel,
    id: ObjectId = null,
  ): Promise<ObjectId> {
    await store.connect();
    const service = store.service(this.serviceName) as Service<StoredModel>;
    if (!service) return null;
    if (!model) return null;
    let newId = id;
    if (id) {
      await service.update(id, model);
    } else {
      const res = await service.create(model);
      newId = res.id;
    }
    logger.info(`Model was saved to data store at location ${store.location}`);
    return newId;
  }

  protected async loadFromDatastore(
    store: DataStore,
    idOrName: ObjectId | string,
  ): Promise<StoredModel> {
    await store.connect();
    const service = store.service(this.serviceName) as Service<StoredModel>;
    if (!service || !idOrName) return null;
    let model;
    try {
      model = await service.get(idOrName);
    } catch (error) {
      const { data } = (await service.find({
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
      logger.info(`Model ${name} was loaded from data store at location ${store.location}`);
    }
    return model;
  }

  mount(): void {
    // Nothing to show
  }
}
