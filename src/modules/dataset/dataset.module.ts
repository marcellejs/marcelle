import { map } from '@most/core';
import type { Service, Paginated } from '@feathersjs/feathers';
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
import { readJSONFile, saveBlob } from '../../utils/file-io';
import { throwError } from '../../utils/error-handling';
import { toKebabCase } from '../../utils/string';

export interface DatasetOptions {
  name: string;
  dataStore?: DataStore;
}

interface DatasetInfo {
  id?: ObjectId;
  datasetName: string;
  count: number;
  labels: string[];
  classes: Record<string, ObjectId[]>;
}

interface DatasetChange {
  level: 'instance' | 'class' | 'dataset';
  type: 'created' | 'updated' | 'deleted' | 'renamed';
  data?: any;
}

export class Dataset extends Module {
  title = 'dataset';

  #unsubscribe: () => void = () => {};
  #dataStore: DataStore;

  instanceService: Service<Instance>;
  datasetService: Service<DatasetInfo>;
  #datasetId: ObjectId;
  #datasetState: DatasetInfo;

  $changes: Stream<DatasetChange[]> = new Stream([]);
  $instances: Stream<ObjectId[]> = new Stream<ObjectId[]>([], true);
  $classes = new Stream<Record<string, ObjectId[]>>({}, true);
  $labels: Stream<string[]> = new Stream([], true);
  $count: Stream<number> = new Stream(0, true);
  $countPerClass: Stream<Record<string, number>>;

  constructor({ name, dataStore = new DataStore() }: DatasetOptions) {
    super();
    this.title = name;
    this.#dataStore = dataStore;
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
    const datasetServiceName = toKebabCase(`dataset-${this.title}`);
    this.datasetService = this.#dataStore.service(datasetServiceName) as Service<DatasetInfo>;
    this.datasetService.hooks({
      before: {
        create: [addScope('datasetName', this.title)].filter((x) => !!x),
        find: [limitToScope('datasetName', this.title)],
        get: [limitToScope('datasetName', this.title)],
        update: [limitToScope('datasetName', this.title)],
        patch: [limitToScope('datasetName', this.title)],
        remove: [limitToScope('datasetName', this.title)],
      },
    });

    const instanceServiceName = toKebabCase(`instances-${this.title}`);
    this.instanceService = this.#dataStore.service(instanceServiceName) as Service<Instance>;
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

    // Fetch dataset info
    const res = await this.datasetService.find({
      query: {
        datasetName: this.title,
        $sort: {
          updatedAt: -1,
        },
      },
    });
    const { total, data } = res as Paginated<DatasetInfo>;
    if (total === 1) {
      this.#datasetId = data[0].id;
      [this.#datasetState] = data;
      this.$count.set(data[0].count);
      this.$labels.set(data[0].labels);
      this.$instances.set(Object.values(data[0].classes).flat());
      this.$classes.set(data[0].classes);
    } else {
      const created = await this.datasetService.create({
        datasetName: this.title,
        labels: [],
        classes: {},
        count: 0,
      });
      this.#datasetId = created.id;
      this.#datasetState = created;
    }
    this.$changes.set([
      {
        level: 'dataset',
        type: 'created',
      },
    ]);
  }

  capture(instanceStream: Stream<Instance>): void {
    this.#unsubscribe();
    if (!instanceStream) {
      this.#unsubscribe = () => {};
      return;
    }
    this.#unsubscribe = instanceStream.subscribe((instance: Instance) => {
      this.addInstance(instance);
    });
  }

  async addInstance(instance: Instance) {
    if (!instance) return;
    const { id } = await this.instanceService.create(instance);
    const labelExists = Object.keys(this.#datasetState.classes).includes(instance.label);
    this.#datasetState.count += 1;
    if (labelExists) {
      this.#datasetState.classes[instance.label].push(id);
    } else {
      this.#datasetState.labels.push(instance.label);
      this.$labels.set(this.#datasetState.labels);
      this.#datasetState.classes[instance.label] = [id];
    }
    await this.datasetService.patch(this.#datasetId, this.#datasetState);
    this.$count.set(this.#datasetState.count);
    this.$classes.set(this.#datasetState.classes);
    this.$instances.set([...this.$instances.value, id]);
    this.$changes.set([
      {
        level: 'instance',
        type: 'created',
        data: { id, label: instance.label },
      },
    ]);
  }

  async renameClass(label: string, newLabel: string): Promise<void> {
    const { classes } = this.#datasetState;
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
    this.#datasetState.labels = Object.keys(classes);
    await this.datasetService.patch(this.#datasetId, this.#datasetState);
    this.$classes.set(classes);
    this.$labels.set(this.#datasetState.labels);
    this.$changes.set([
      {
        level: 'class',
        type: 'renamed',
        data: {
          srcLabel: label,
          label: newLabel,
        },
      },
    ]);
  }

  async deleteClass(label: string): Promise<void> {
    const { classes } = this.#datasetState;
    if (!Object.keys(classes).includes(label)) return;
    const delIns = classes[label];
    delete classes[label];
    await Promise.all(delIns.map((id) => this.instanceService.remove(id)));
    this.#datasetState.labels = Object.keys(classes);
    this.#datasetState.count -= delIns.length;
    await this.datasetService.patch(this.#datasetId, this.#datasetState);
    this.$classes.set(classes);
    this.$labels.set(this.#datasetState.labels);
    const newInstances = this.$instances.value.filter((x) => !delIns.includes(x));
    this.$instances.set(newInstances);
    this.$count.set(this.#datasetState.count);
    this.$changes.set([
      {
        level: 'class',
        type: 'deleted',
        data: label,
      },
    ]);
  }

  async clear(): Promise<void> {
    const { total } = (await this.instanceService.find({
      query: { $limit: 0 },
    })) as Paginated<Instance>;
    const result = await this.instanceService.find({ query: { $select: ['id'], $limit: total } });
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
  async upload(files: File[]): Promise<void> {
    const jsonFiles = await Promise.all(
      files.filter((f) => f.type === 'application/json').map((f) => readJSONFile(f)),
    );
    await Promise.all(
      jsonFiles.map((fileContent: { instances: Instance[] }) =>
        fileContent.instances.map((instance: Instance) => {
          const { id, ...instanceNoId } = instance;
          return this.addInstance(instanceNoId).catch((e) => {
            throwError(e);
          });
        }),
      ),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  mount(): void {}

  stop(): void {
    super.stop();
    this.#unsubscribe();
  }
}
