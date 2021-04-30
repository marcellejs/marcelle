import type { Paginated, Service, Params as FeathersParams } from '@feathersjs/feathers';
import { Instance, logger, Module, ObjectId, Stream } from '../core';
import { dataStore, DataStore } from '../data-store';
import { addScope, limitToScope, dataURL2ImageData, imageData2DataURL } from '../data-store/hooks';
import { iterableFromService, ServiceIterable } from '../data-store/service-iterable';
import { throwError } from '../utils/error-handling';
import { readJSONFile, saveBlob } from '../utils/file-io';
import { toKebabCase } from '../utils/string';

interface DatasetChange {
  level: 'instance' | 'dataset';
  type: 'created' | 'updated' | 'removed' | 'renamed';
  data?: unknown;
}

export class Dataset<InputType, OutputType> extends Module {
  title = 'dataset';
  name: string;

  #store: DataStore;
  ready: Promise<void>;

  instanceService: Service<Instance<InputType, OutputType>>;

  $count: Stream<number> = new Stream(0, true);
  $changes: Stream<DatasetChange[]> = new Stream([]);

  constructor(name: string, store = dataStore()) {
    super();
    this.name = name;
    this.title = `dataset (${name})`;
    this.#store = store;
    this.start();
    this.ready = new Promise((resolve, reject) => {
      this.#store
        .connect()
        .then(() => this.setup())
        .then(resolve)
        .catch(() => {
          logger.log(`[dataset:${name}] dataStore connection failed`);
          reject();
        });
    });
  }

  async setup(): Promise<void> {
    const instanceServiceName = toKebabCase(`instances-${this.name}`);
    this.instanceService = this.#store.service(instanceServiceName) as Service<
      Instance<InputType, OutputType>
    >;
    this.instanceService.hooks({
      before: {
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

    const { total } = (await this.instanceService.find({ $limit: 0 })) as Paginated<
      Partial<Instance<InputType, OutputType>>
    >;
    this.$count.set(total);
    this.$changes.set([
      {
        level: 'dataset',
        type: 'created',
      },
    ]);
    this.watchChanges();
  }

  watchChanges(): void {
    this.instanceService.on('created', (x: Instance<InputType, OutputType>) => {
      this.$count.set(this.$count.value + 1);
      this.$changes.set([
        {
          level: 'instance',
          type: 'created',
          data: x,
        },
      ]);
    });

    const cb = (x: Instance<InputType, OutputType>) => {
      const instance = {
        ...x,
        id: x.id || x._id,
      };
      this.$changes.set([
        {
          level: 'instance',
          type: 'updated',
          data: instance,
        },
      ]);
    };
    this.instanceService.on('updated', cb);
    this.instanceService.on('patched', cb);

    this.instanceService.on('removed', (x: Instance<InputType, OutputType>) => {
      const instance = {
        ...x,
        id: x.id || x._id,
      };
      this.$changes.set([
        {
          level: 'instance',
          type: 'removed',
          data: instance,
        },
      ]);
    });
  }

  items(): ServiceIterable<Instance<InputType, OutputType>> {
    return iterableFromService(this.instanceService);
  }

  async get(id: ObjectId, params?: FeathersParams): Promise<Instance<InputType, OutputType>> {
    return this.instanceService.get(id, params);
  }

  async create(
    instance: Instance<InputType, OutputType>,
    params?: FeathersParams,
  ): Promise<Instance<InputType, OutputType>> {
    return this.instanceService.create(instance, params);
  }

  update(
    id: ObjectId,
    instance: Instance<InputType, OutputType>,
    params?: FeathersParams,
  ): Promise<Instance<InputType, OutputType>> {
    return this.instanceService.update(id, instance, params);
  }

  patch(
    id: ObjectId,
    changes: Partial<Instance<InputType, OutputType>>,
    params?: FeathersParams,
  ): Promise<Instance<InputType, OutputType>> {
    return this.instanceService.patch(id, changes, params);
  }

  remove(id: ObjectId, params?: FeathersParams): Promise<Instance<InputType, OutputType>> {
    return this.instanceService.remove(id, params);
  }

  async clear(): Promise<void> {
    await this.remove(null, { query: {} });
  }

  async download(): Promise<void> {
    const instances = await this.instanceService.find();
    const fileContents = {
      marcelleMeta: {
        type: 'dataset',
      },
      instances: (instances as Paginated<Instance<InputType, OutputType>>).data,
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
    const addPromises = jsonFiles.map(
      (fileContent: { instances: Instance<InputType, OutputType>[] }) =>
        fileContent.instances.map((instance: Instance<InputType, OutputType>) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...instanceNoId } = instance;
          return this.create(instanceNoId).catch((e) => {
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
