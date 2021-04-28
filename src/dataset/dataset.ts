import type { Paginated, Service, Params as FeathersParams } from '@feathersjs/feathers';
import { Instance, logger, Module, ObjectId, Stream } from '../core';
import { dataStore, DataStore } from '../data-store';
import { addScope, limitToScope, dataURL2ImageData, imageData2DataURL } from '../data-store/hooks';
import { iterableFromService, ServiceIterable } from '../data-store/service-iterable';
import { throwError } from '../utils/error-handling';
import { readJSONFile, saveBlob } from '../utils/file-io';
import { noop } from '../utils/misc';
import { toKebabCase } from '../utils/string';

interface DatasetChange {
  level: 'instance' | 'dataset';
  type: 'created' | 'updated' | 'removed' | 'renamed';
  data?: unknown;
}

export class Dataset extends Module {
  title = 'dataset';
  name: string;

  #store: DataStore;
  #unsubscribe: () => void = noop;
  #instances: Array<Partial<Instance>> = [];

  instanceService: Service<Instance>;

  $count: Stream<number> = new Stream(0, true);
  $labels: Stream<string[]> = new Stream([], true);
  $classes: Stream<Record<string, ObjectId[]>> = new Stream({}, true);
  $instances: Stream<ObjectId[]> = new Stream([], true);

  $changes: Stream<DatasetChange[]> = new Stream([]);

  constructor(name: string, store = dataStore()) {
    super();
    this.name = name;
    this.title = `dataset (${name})`;
    this.#store = store;
    this.start();
    this.#store
      .connect()
      .then(() => {
        this.setup();
      })
      .catch(() => {
        logger.log(`[dataset:${name}] dataStore connection failed`);
      });
  }

  async setup(): Promise<void> {
    const instanceServiceName = toKebabCase(`instances-${this.name}`);
    this.instanceService = this.#store.service(instanceServiceName) as Service<Instance>;
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

    this.#instances = await this.items().select(['id', 'label']).toArray();
    const count = this.#instances.length;
    const classes: Record<string, ObjectId[]> = {};
    for (const { id, label } of this.#instances) {
      classes[label] = (classes[label] || []).concat([id]);
    }
    const labels = Object.keys(classes);
    this.$count.set(count);
    this.$labels.set(labels);
    this.$classes.set(classes);
    this.$instances.set(this.#instances.map(({ id }) => id));
    this.$changes.set([
      {
        level: 'dataset',
        type: 'created',
      },
    ]);
    this.watchChanges();
  }

  watchChanges(): void {
    this.instanceService.on('created', (x: Instance) => {
      this.$count.set(this.$count.value + 1);
      const classes = this.$classes.value;
      if (!classes[x.label]) {
        classes[x.label] = [];
        this.$labels.set(Object.keys(classes));
      }
      classes[x.label].push(x.id);
      this.$classes.set(classes);
      this.$instances.set(this.$instances.value.concat([x.id]));
      this.$changes.set([
        {
          level: 'instance',
          type: 'created',
          data: x,
        },
      ]);
    });

    const cb = (x: Instance) => {
      const instance = {
        id: x.id || x._id,
        label: x.label,
        thumbnail: x.thumbnail,
      };
      const instanceRef = this.#instances.find((y) => y.id === instance.id);
      const oldLabel = instanceRef.label;
      const classes = this.$classes.value;
      classes[oldLabel] = classes[oldLabel].filter((y) => y !== instance.id);
      classes[instance.label] = (classes[instance.label] || []).concat([instance.id]);
      instanceRef.label = instance.label;
      this.$classes.set(classes);
      if (instance.label !== oldLabel) {
        this.$changes.set([
          {
            level: 'instance',
            type: 'renamed',
            data: instance,
          },
        ]);
      } else {
        this.$changes.set([
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

    this.instanceService.on('removed', (x: Instance) => {
      const id = x.id || x._id;
      const { label } = x;
      const classes = this.$classes.value;
      classes[label] = classes[label].filter((y) => y !== id);
      if (classes[label].length === 0) {
        delete classes[label];
      }
      this.#instances = this.#instances.filter((y) => y.id !== id);
      this.$count.set(this.$count.value - 1);
      this.$classes.set(classes);
      this.$changes.set([
        {
          level: 'instance',
          type: 'removed',
          data: id,
        },
      ]);
    });
  }

  capture(instanceStream: Stream<Instance>): void {
    this.#unsubscribe();
    if (!instanceStream) {
      this.#unsubscribe = noop;
      return;
    }
    this.#unsubscribe = instanceStream.subscribe((instance: Instance) => {
      this.create(instance);
    });
  }

  items(): ServiceIterable<Instance> {
    return iterableFromService(this.instanceService);
  }

  async get(id: ObjectId, params?: FeathersParams): Promise<Instance> {
    return this.instanceService.get(id, params);
  }

  async create(instance: Instance, params?: FeathersParams): Promise<Instance> {
    return this.instanceService.create(instance, params);
  }

  update(id: ObjectId, instance: Instance, params?: FeathersParams): Promise<Instance> {
    return this.instanceService.update(id, instance, params);
  }

  patch(id: ObjectId, changes: Partial<Instance>, params?: FeathersParams): Promise<Instance> {
    return this.instanceService.patch(id, changes, params);
  }

  remove(id: ObjectId, params?: FeathersParams): Promise<Instance> {
    return this.instanceService.remove(id, params);
  }

  async renameClass(label: string, newLabel: string): Promise<void> {
    await this.patch(null, { label: newLabel }, { query: { label } });
  }

  async removeClass(label: string): Promise<void> {
    await this.remove(null, { query: { label } });
  }

  async clear(): Promise<void> {
    await Promise.all(this.$labels.value.map((label) => this.removeClass(label)));
  }

  async download(): Promise<void> {
    const instances = await this.instanceService.find();
    const fileContents = {
      marcelleMeta: {
        type: 'dataset',
      },
      classes: this.$classes.value,
      instances: (instances as Paginated<Instance>).data,
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
    const addPromises = jsonFiles.map((fileContent: { instances: Instance[] }) =>
      fileContent.instances.map((instance: Instance) => {
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

  stop(): void {
    super.stop();
    this.#unsubscribe();
  }
}
