import type { Paginated, Params as FeathersParams, Query, HookContext } from '@feathersjs/feathers';
import { BehaviorSubject } from 'rxjs';
import type { Instance, ObjectId, Service } from '../types';
import { Component } from '../component';
import { dataStore, DataStore } from '../data-store';
import type { ServiceIterable } from '../data-store/service-iterable';
import { throwError } from '../../utils/error-handling';
import { readJSONFile, saveBlob } from '../../utils/file-io';
import { toKebabCase } from '../../utils/string';
import { mergeDeep } from '../../utils';
import sift from 'sift';
import { addScope, dataURL2ImageData, imageData2DataURL, limitToScope } from '../data-store/hooks';

interface DatasetChange {
  level: 'instance' | 'dataset';
  type: 'created' | 'updated' | 'removed' | 'renamed';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export class Dataset<T extends Instance> extends Component {
  title = 'dataset';
  name: string;

  readonly isDataset = true;
  #store: DataStore;
  ready: Promise<void>;

  instanceService: Service<T>;
  query: Query = {};
  #updatedCreate = new Set<string>();

  $count = new BehaviorSubject(0);
  $changes = new BehaviorSubject<DatasetChange[]>([]);

  constructor(name: string, store = dataStore()) {
    super();
    this.name = name;
    this.title = `dataset (${name})`;
    this.#store = store;
    this.ready = new Promise((resolve, reject) => {
      this.#store
        .connect()
        .then(() => this.setup())
        .then(resolve)
        .catch((e) => {
          const err = new Error(e?.message);
          err.name = `Dataset Error (${name}): datastore connection failed`;
          throwError(err, { duration: 0 });
          reject(err);
        });
    });
  }

  protected async setup(): Promise<void> {
    const instanceServiceName = toKebabCase(`instances-${this.name}`);
    this.instanceService = this.#store.service(instanceServiceName) as Service<T>;

    if (this.instanceService.__hooks.before.find === undefined) {
      this.instanceService.hooks({
        before: {
          all: [],
          create: [addScope('datasetName', this.name), imageData2DataURL],
          find: [limitToScope('datasetName', this.name)],
          get: [limitToScope('datasetName', this.name)],
          update: [limitToScope('datasetName', this.name)],
          patch: [limitToScope('datasetName', this.name)],
          remove: [limitToScope('datasetName', this.name)],
        },
        after: {
          find: [dataURL2ImageData],
          get: [dataURL2ImageData],
        },
      });
    }

    this.instanceService.hooks({
      before: {
        update: [this.checkUpdates],
        patch: [this.checkUpdates],
      },
    });

    await this.reset();
    this.watchChanges();
  }

  protected async reset(): Promise<void> {
    const { total } = (await this.find({ query: { $limit: 0 } })) as Paginated<Partial<T>>;
    this.$count.next(total);
    this.$changes.next([
      {
        level: 'dataset',
        type: 'created',
      },
    ]);
  }

  protected async checkUpdates(context: HookContext): Promise<void> {
    if (Object.keys(this.query).length === 0) return;
    const respectsQuery = sift(this.query);
    const isTargetValid = respectsQuery(context.data);
    try {
      const current = await this.get(context.id as string);
      const isCurrentValid = respectsQuery(current);
      if (isCurrentValid && !isTargetValid) {
        this.$count.next(this.$count.getValue() - 1);
        this.$changes.next([
          {
            level: 'instance',
            type: 'removed',
            data: current,
          },
        ]);
      }
    } catch (error) {
      this.#updatedCreate.add(context.id as string);
    }
  }

  protected watchChanges(): void {
    const respectsQuery = sift(this.query);
    this.instanceService.on('created', (x: T) => {
      if (!respectsQuery(x)) return;
      const instance = {
        ...x,
        id: x.id || x._id,
      };
      this.$count.next(this.$count.getValue() + 1);
      this.$changes.next([
        {
          level: 'instance',
          type: 'created',
          data: instance,
        },
      ]);
    });

    const cb = (x: T) => {
      if (!respectsQuery(x)) return;
      const instance = {
        ...x,
        id: x.id || x._id,
      };
      if (this.#updatedCreate.has(instance.id)) {
        this.$count.next(this.$count.getValue() + 1);
        this.$changes.next([
          {
            level: 'instance',
            type: 'created',
            data: instance,
          },
        ]);
        this.#updatedCreate.delete(instance.id);
      } else {
        this.$changes.next([
          {
            level: 'instance',
            type: 'updated',
            data: instance,
          },
        ]);
      }
    };
    this.instanceService.on('updated', cb);
    this.instanceService.on('patched', cb);

    this.instanceService.on('removed', (x: T) => {
      if (!respectsQuery(x)) return;
      this.$count.next(this.$count.getValue() - 1);
      const instance = {
        ...x,
        id: x.id || x._id,
      };
      this.$changes.next([
        {
          level: 'instance',
          type: 'removed',
          data: instance,
        },
      ]);
    });
  }

  async sift(query: Query = {}): Promise<void> {
    this.query = query;
    return this.ready.then(() => this.reset());
  }

  items(): ServiceIterable<T> {
    return this.instanceService.items().query(this.query);
  }

  async find(params?: FeathersParams): Promise<Paginated<T>> {
    const p = mergeDeep(params || {}, { query: this.query });
    return this.instanceService.find(p) as Promise<Paginated<T>>;
  }

  async get(id: ObjectId, params?: FeathersParams): Promise<T> {
    const p = mergeDeep(params || {}, { query: this.query });
    return this.instanceService.get(id, p);
  }

  async create(instance: Partial<T>, params?: FeathersParams): Promise<T> {
    const p = mergeDeep(params || {}, { query: this.query });
    return this.instanceService.create(instance, p);
  }

  async update(id: ObjectId, instance: T, params?: FeathersParams): Promise<T> {
    const p = mergeDeep(params || {}, { query: this.query });
    return this.instanceService.update(id, instance, p);
  }

  async patch(id: ObjectId, changes: Partial<T>, params?: FeathersParams): Promise<T> {
    const p = mergeDeep(params || {}, { query: this.query });
    return this.instanceService.patch(id, changes, p);
  }

  async remove(id: ObjectId, params?: FeathersParams): Promise<T> {
    const p = mergeDeep(params || {}, { query: this.query });
    return this.instanceService.remove(id, p);
  }

  async clear(): Promise<void> {
    await this.remove(null, { query: {} });
  }

  async distinct(field: string): Promise<T['y'][]> {
    const query = { $distinct: field, ...this.query };
    return this.instanceService.find({ query }) as Promise<T['y'][]>;
  }

  async download(): Promise<void> {
    const instances = await this.find();
    const fileContents = {
      marcelleMeta: {
        type: 'dataset',
      },
      instances: (instances as Paginated<T>).data,
    };
    const today = new Date(Date.now());
    const fileName = `${this.title}-${today.toISOString()}.json`;
    await saveBlob(JSON.stringify(fileContents), fileName, 'text/plain');
  }

  async upload(files: File[]): Promise<void> {
    const filePromises = files
      .filter((f) => f.type === 'application/json')
      .map((f) => readJSONFile(f));
    const jsonFiles = await Promise.all(filePromises);
    const addPromises = jsonFiles.map((fileContent: { instances: T[] }) =>
      fileContent.instances.map((instance: T) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...instanceNoId } = instance;
        return this.create(instanceNoId as Partial<T>).catch((e) => {
          throwError(e);
        });
      }),
    );
    await Promise.all(addPromises);
  }

  mount(): void {
    // Nothing to show
  }
}
