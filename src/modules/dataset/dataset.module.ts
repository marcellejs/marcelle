import { never, map, skipRepeatsWith } from '@most/core';
import { Service, Paginated } from '@feathersjs/feathers';
import { dequal } from 'dequal';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { logger } from '../../core/logger';
import type { Instance, ObjectId } from '../../core/types';
import { Backend } from '../../backend/backend';
import { addScope, imageData2DataURL, limitToScope, dataURL2ImageData } from '../../backend/hooks';
import { saveBlob } from '../../utils/file-io';
import Component from './dataset.svelte';

export interface DatasetOptions {
  name: string;
  backend?: Backend;
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export class Dataset extends Module {
  name = 'dataset';
  description = 'Dataset';

  #unsubscribe: () => void = () => {};
  #backend: Backend;

  instanceService: Service<Instance>;

  $created: Stream<ObjectId> = new Stream<ObjectId>(never());
  $instances: Stream<ObjectId[]> = new Stream<ObjectId[]>([], true);
  $classes = new Stream<Record<string, ObjectId[]>>({}, true);
  $labels: Stream<string[]>;
  $count: Stream<number>;
  $countPerClass: Stream<Record<string, number>>;

  constructor({ name, backend = new Backend() }: DatasetOptions) {
    super();
    this.name = name;
    this.#backend = backend;
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
    this.#backend
      .connect()
      .then(() => {
        this.setup();
      })
      .catch(() => {
        logger.log('[dataset] backend connection failed');
      });
  }

  async setup(): Promise<void> {
    const serviceName = toKebabCase(`instances-${this.name}`);
    this.#backend.createService(serviceName);
    this.instanceService = this.#backend.service(serviceName) as Service<Instance>;
    this.instanceService.hooks({
      before: {
        create: [
          addScope('datasetName', this.name),
          imageData2DataURL,
          // this.#backend.backendType !== BackendType.Memory && imageData2DataURL,
        ].filter((x) => !!x),
        find: [limitToScope('datasetName', this.name)],
        get: [limitToScope('datasetName', this.name)],
        update: [limitToScope('datasetName', this.name)],
        patch: [limitToScope('datasetName', this.name)],
        remove: [limitToScope('datasetName', this.name)],
      },
      after: {
        // find: [this.#backend.backendType !== BackendType.Memory && dataURL2ImageData].filter(
        find: [dataURL2ImageData].filter((x) => !!x),
        // get: [this.#backend.backendType !== BackendType.Memory && dataURL2ImageData].filter(
        get: [dataURL2ImageData].filter((x) => !!x),
      },
    });

    // Fetch instances
    const resInstances = await this.instanceService.find({
      query: { $select: ['id', '_id', 'label'] },
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
    const fileName = `${this.name}-${today.toISOString()}.json`;
    await saveBlob(JSON.stringify(fileContents), fileName, 'text/plain');
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        dataset: this,
        count: this.$count,
        classes: this.$classes,
      },
    });
  }

  stop(): void {
    super.stop();
    this.#unsubscribe();
  }
}
