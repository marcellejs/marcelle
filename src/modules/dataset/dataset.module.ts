import { map, skipRepeatsWith } from '@most/core';
import { Service, Paginated } from '@feathersjs/feathers';
import dequal from 'dequal';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import type { Instance, ObjectId } from '../../core/types';
import { Backend } from '../../backend/backend';
import { addScope, imageData2DataURL, limitToScope, dataURL2ImageData } from '../../backend/hooks';
import { saveBlob } from '../../utils/file-io';

export interface DatasetOptions {
  name: string;
  backend?: Backend;
}

export class Dataset extends Module {
  name = 'dataset';
  description = 'Dataset';

  #unsubscribe: () => void = () => {};
  #backend: Backend;

  instanceService: Service<Instance>;

  $instances: Stream<ObjectId[]> = new Stream([], true);
  $classes = new Stream<Record<string, ObjectId[]>>({}, true);
  $labels: Stream<string[]>;
  $count: Stream<number>;
  $countPerClass: Stream<Record<string, number>>;

  constructor({ name, backend = new Backend() }: DatasetOptions) {
    super();
    this.name = name;
    this.#backend = backend;
    this.#backend.createService('instances');
    this.instanceService = this.#backend.service('instances') as Service<Instance>;
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

    this.instanceService.find({ query: { $select: ['id', '_id', 'label'] } }).then((result) => {
      const { data } = result as Paginated<Instance>;
      this.$instances.set(data.map((x) => x.id));
      this.$classes.set(
        data.reduce((c: Record<string, ObjectId[]>, instance: Instance) => {
          const x = Object.keys(c).includes(instance.label) ? c[instance.label] : [];
          return { ...c, [instance.label]: x.concat([instance.id]) };
        }, {}),
      );
    });
    this.$labels = new Stream(skipRepeatsWith(dequal, map(Object.keys, this.$classes)));
    this.$count = new Stream(
      map((x) => x.length, this.$instances),
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

  // eslint-disable-next-line class-methods-use-this
  mount(): void {}

  stop(): void {
    super.stop();
    this.#unsubscribe();
  }
}
