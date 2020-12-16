import { never, map, skipRepeatsWith } from '@most/core';
import type { Service, Paginated } from '@feathersjs/feathers';
import { dequal } from 'dequal';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { logger } from '../../core/logger';
import type { Instance, ObjectId } from '../../core/types';
import { DataStore } from '../../data-store/data-store';
import {
  addScope,
  imageData2DataURL,
  limitToScope,
  dataURL2ImageData,
} from '../../data-store/hooks';
import { saveBlob } from '../../utils/file-io';

export interface DatasetOptions {
  name: string;
  dataStore?: DataStore;
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export class Dataset extends Module {
  title = 'dataset';

  #unsubscribe: () => void = () => {};
  #dataStore: DataStore;

  instanceService: Service<Instance>;

  $created: Stream<ObjectId> = new Stream<ObjectId>(never());
  $instances: Stream<ObjectId[]> = new Stream<ObjectId[]>([], true);
  $classes = new Stream<Record<string, ObjectId[]>>({}, true);
  $labels: Stream<string[]>;
  $count: Stream<number>;
  $countPerClass: Stream<Record<string, number>>;

  constructor({ name, dataStore = new DataStore() }: DatasetOptions) {
    super();
    this.title = name;
    this.#dataStore = dataStore;
    this.$labels = new Stream(skipRepeatsWith(dequal, map(Object.keys, this.$classes)));
    this.$count = new Stream(
      this.$instances.map((x) => x.length),
      true,
    );
    this.$countPerClass = new Stream(
      map(
        (x) =>
          Object.entries(x).reduce(
            (y, [label, instances]) => ({ ...y, [label]: instances.length }),
            {},
          ),
        this.$classes,
      ),
      true,
    );
    this.start();
    this.#dataStore
      .connect()
      .then(() => {
        this.setup();
      })
      .catch(() => {
        logger.log('[dataset] dataStore connection failed');
      });
  }

  async setup(): Promise<void> {
    const serviceName = toKebabCase(`instances-${this.title}`);
    // this.#dataStore.createService(serviceName);
    this.instanceService = this.#dataStore.service(serviceName) as Service<Instance>;
    this.instanceService.hooks({
      before: {
        create: [addScope('datasetName', this.title), imageData2DataURL].filter((x) => !!x),
        find: [limitToScope('datasetName', this.title)],
        get: [limitToScope('datasetName', this.title)],
        update: [limitToScope('datasetName', this.title)],
        patch: [limitToScope('datasetName', this.title)],
        remove: [limitToScope('datasetName', this.title)],
      },
      after: {
        find: [dataURL2ImageData].filter((x) => !!x),
        get: [dataURL2ImageData].filter((x) => !!x),
      },
    });

    // Fetch instances
    const resInstances = await this.instanceService.find({
      query: { $select: ['id', 'label'] },
    });
    const { data } = resInstances as Paginated<Instance>;
    this.$instances.set(data.map((x) => x.id));
    this.$classes.set(
      data.reduce((c: Record<string, ObjectId[]>, instance: Instance) => {
        const x = Object.keys(c).includes(instance.label) ? c[instance.label] : [];
        return { ...c, [instance.label]: x.concat([instance.id]) };
      }, {}),
    );
  }

  capture(instanceStream: Stream<Instance>): void {
    this.#unsubscribe();
    if (!instanceStream) {
      this.#unsubscribe = () => {};
      return;
    }
    this.#unsubscribe = instanceStream.subscribe(async (instance: Instance) => {
      if (!instance) return;
      const { id } = await this.instanceService.create(instance);
      const x = Object.keys(this.$classes.value).includes(instance.label)
        ? this.$classes.value[instance.label]
        : [];
      this.$classes.set({ ...this.$classes.value, [instance.label]: [...x, id] });
      this.$instances.set([...this.$instances.value, id]);
      this.$created.set(id);
    });
  }

  async renameClass(label: string, newLabel: string): Promise<void> {
    const classes = this.$classes.value;
    if (!Object.keys(classes).includes(label)) return;
    await Promise.all(
      classes[label].map((id) => this.instanceService.patch(id, { label: newLabel })),
    );
    if (Object.keys(classes).includes(newLabel)) {
      classes[newLabel] = classes[newLabel].concat(classes[label]);
    } else {
      classes[newLabel] = classes[label];
    }
    delete classes[label];
    this.$classes.set(classes);
    this.$instances.set(this.$instances.value);
  }

  async deleteClass(label: string): Promise<void> {
    const classes = this.$classes.value;
    if (!Object.keys(classes).includes(label)) return;
    const delIns = classes[label];
    delete classes[label];
    await Promise.all(delIns.map((id) => this.instanceService.remove(id)));
    const newInstances = this.$instances.value.filter((x) => !delIns.includes(x));
    this.$classes.set(classes);
    this.$instances.set(newInstances);
  }

  async clear(): Promise<void> {
    const result = await this.instanceService.find({ query: { $select: ['id'] } });
    const { data } = result as Paginated<Instance>;
    await Promise.all(data.map(({ id }) => this.instanceService.remove(id)));
    this.$instances.set([]);
    this.$classes.set({});
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

  // eslint-disable-next-line class-methods-use-this
  mount(): void {}

  stop(): void {
    super.stop();
    this.#unsubscribe();
  }
}
