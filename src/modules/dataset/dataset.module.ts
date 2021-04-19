import { map } from '@most/core';
import { cloneDeep } from 'lodash';
import type { Service, Paginated, Params as FeathersParams } from '@feathersjs/feathers';
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
import { readJSONFile, saveBlob } from '../../utils/file-io';
import { throwError } from '../../utils/error-handling';
import { toKebabCase } from '../../utils/string';
import { preventConcurrentCalls } from '../../utils/asynchronicity';
import { noop } from '../../utils/misc';

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
  data?: unknown;
}

export class Dataset extends Module {
  title = 'dataset';

  #unsubscribe: () => void = noop;
  #dataStore: DataStore;

  instanceService: Service<Instance>;
  datasetService: Service<DatasetInfo>;
  #datasetId: ObjectId;
  #datasetState: DatasetInfo;
  statePromise: Promise<void> = Promise.resolve();

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
    this.watchChanges();
  }

  watchChanges(): void {
    const cb = (x: DatasetInfo) => {
      if (x.id === this.#datasetId) {
        this.updateState(x);
      }
    };
    this.datasetService.on('updated', cb);
    this.datasetService.on('patched', cb);
  }

  updateState(x: DatasetInfo): void {
    if (dequal(x, this.#datasetState)) return;
    const changes: DatasetChange[] = [];
    if (!dequal(x.labels, this.#datasetState.labels)) {
      const labelsCreated = x.labels.filter((y) => !this.#datasetState.labels.includes(y));
      const labelsDeleted = this.#datasetState.labels.filter((y) => !x.labels.includes(y));
      if (
        labelsCreated.length === 1 &&
        labelsDeleted.length === 1 &&
        dequal(x.classes[labelsCreated[0]], this.#datasetState.classes[labelsDeleted[0]])
      ) {
        changes.push({
          level: 'class',
          type: 'renamed',
          data: {
            srcLabel: labelsDeleted[0],
            label: labelsCreated[0],
          },
        });
      } else {
        for (const newLabel of labelsCreated) {
          changes.push({
            level: 'class',
            type: 'created',
            data: newLabel,
          });
        }
        for (const deletedLabel of labelsDeleted) {
          changes.push({
            level: 'class',
            type: 'deleted',
            data: deletedLabel,
          });
        }
      }
      this.$labels.set(x.labels);
    }
    const newInstances = Object.entries(x.classes)
      .map(([label, ids]) => ids.map((id) => ({ id, label })))
      .flat();
    const oldInstances = Object.entries(this.#datasetState.classes)
      .map(([label, ids]) => ids.map((id) => ({ id, label })))
      .flat();
    if (!dequal(newInstances, oldInstances)) {
      const instancesCreated = newInstances.filter(
        (y) => !oldInstances.map((z) => z.id).includes(y.id),
      );
      const instancesDeleted = oldInstances.filter(
        (y) => !newInstances.map((z) => z.id).includes(y.id),
      );
      const instancesRenamed: { id: ObjectId; label: string }[] = [];
      for (const { id, label } of newInstances) {
        const oldIdx = oldInstances.map((z) => z.id).indexOf(id);
        if (oldIdx >= 0 && label !== oldInstances[oldIdx].label) {
          instancesRenamed.push({ id, label });
        }
      }
      for (const data of instancesCreated) {
        changes.push({
          level: 'instance',
          type: 'created',
          data,
        });
      }
      for (const { id } of instancesDeleted) {
        changes.push({
          level: 'instance',
          type: 'deleted',
          data: id,
        });
      }
      for (const data of instancesRenamed) {
        changes.push({
          level: 'instance',
          type: 'renamed',
          data,
        });
      }
      this.$instances.set(instancesCreated.map(({ id }) => id));
      this.$count.set(x.count);
    }
    this.#datasetState = x;
    this.$classes.set(x.classes);
    this.$changes.set(changes);
  }

  capture(instanceStream: Stream<Instance>): void {
    this.#unsubscribe();
    if (!instanceStream) {
      this.#unsubscribe = noop;
      return;
    }
    this.#unsubscribe = instanceStream.subscribe((instance: Instance) => {
      this.addInstance(instance);
    });
  }

  async getInstance(id: ObjectId, fields: string[] = undefined): Promise<Instance> {
    const opts: FeathersParams = {};
    if (fields) {
      opts.query = { $select: fields };
    }
    return this.instanceService.get(id, opts);
  }

  async getAllInstances(fields: string[] = undefined): Promise<Instance[]> {
    const baseQuery: FeathersParams['query'] = {
      $limit: 30,
    };
    if (fields) {
      baseQuery.$select = fields;
    }
    const results = (await Promise.all(
      Array.from(Array(Math.ceil(this.$count.value / 30)), (_, i) => {
        const query = { ...baseQuery, $skip: i * 30 };
        return this.instanceService.find({ query });
      }),
    )) as Paginated<Instance>[];
    const allInstances = results.map(({ data }) => data).flat();
    return allInstances;
  }

  @preventConcurrentCalls('statePromise')
  async addInstance(instance: Instance): Promise<void> {
    if (!instance) return;
    const ds = cloneDeep(this.#datasetState);
    const { id } = await this.instanceService.create(instance);
    const labelExists = Object.keys(ds.classes).includes(instance.label);
    ds.count += 1;
    if (labelExists) {
      ds.classes[instance.label].push(id);
    } else {
      ds.labels.push(instance.label);
      ds.classes[instance.label] = [id];
    }
    await this.datasetService.patch(this.#datasetId, ds);
  }

  @preventConcurrentCalls('statePromise')
  async deleteInstance(id: ObjectId): Promise<void> {
    const instance = await this.instanceService.get(id);
    if (!instance) return;
    const ds = cloneDeep(this.#datasetState);
    const instanceClass = ds.classes[instance.label];
    if (instanceClass.length === 1) {
      await this.deleteClass(instance.label);
      return;
    }
    await this.instanceService.remove(id);
    ds.classes[instance.label] = ds.classes[instance.label].filter((x) => x !== id);
    ds.count -= 1;
    await this.datasetService.patch(this.#datasetId, ds);
  }

  @preventConcurrentCalls('statePromise')
  async changeInstanceLabel(id: ObjectId, newLabel: string): Promise<void> {
    const instance = await this.instanceService.get(id);
    if (!instance) return;
    const ds = cloneDeep(this.#datasetState);
    const instanceClass = ds.classes[instance.label];
    await this.instanceService.patch(id, { label: newLabel });
    if (instanceClass.length === 1) {
      delete ds.classes[instance.label];
      ds.labels = ds.labels.filter((x) => x !== instance.label);
    } else {
      ds.classes[instance.label] = ds.classes[instance.label].filter((x) => x !== id);
    }
    if (ds.classes[newLabel]) {
      ds.classes[newLabel].push(id);
    } else {
      ds.classes[newLabel] = [id];
      ds.labels.push(newLabel);
    }
    await this.datasetService.patch(this.#datasetId, ds);
  }

  @preventConcurrentCalls('statePromise')
  async renameClass(label: string, newLabel: string): Promise<void> {
    const ds = cloneDeep(this.#datasetState);
    const { classes } = ds;
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
    ds.labels = Object.keys(classes);
    await this.datasetService.patch(this.#datasetId, ds);
  }

  @preventConcurrentCalls('statePromise')
  async deleteClass(label: string): Promise<void> {
    const ds = cloneDeep(this.#datasetState);
    const { classes } = ds;
    if (!Object.keys(classes).includes(label)) return;
    const delIns = classes[label];
    delete classes[label];
    await Promise.all(delIns.map((id) => this.instanceService.remove(id)));
    ds.labels = Object.keys(classes);
    ds.count -= delIns.length;
    await this.datasetService.patch(this.#datasetId, ds);
  }

  async clear(): Promise<void> {
    const labels = this.$labels.value;
    let p = Promise.resolve();
    for (let i = 0; i < labels.length; i++) {
      p = p.then(() => this.deleteClass(labels[i]));
    }
    return p;
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
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...instanceNoId } = instance;
          return this.addInstance(instanceNoId).catch((e) => {
            throwError(e);
          });
        }),
      ),
    );
  }

  mount(): void {
    // Nothing to show
  }

  stop(): void {
    super.stop();
    this.#unsubscribe();
  }
}
