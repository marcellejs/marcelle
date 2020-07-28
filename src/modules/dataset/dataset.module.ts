import { map, skipRepeatsWith } from '@most/core';
import { Service } from '@feathersjs/feathers';
import dequal from 'dequal';
import { Module } from '../../core/module';
import Component from './dataset.svelte';
import { Stream } from '../../core/stream';
import type { Instance, InstanceId } from '../../core/types';
import { Backend, BackendType } from '../../backend/backend';
import {
  addDatasetName,
  imageData2DataURL,
  limitToDataset,
  dataURL2ImageData,
} from './dataset.hooks';

export interface DatasetOptions {
  name: string;
  backend?: Backend;
}

export class Dataset extends Module {
  name = 'dataset';
  description = 'Dataset';

  #unsubscribe: () => void;
  #backend: Backend;

  instanceService: Service<Instance>;

  $instances: Stream<InstanceId[]> = new Stream([], true);
  $classes = new Stream<Record<string, InstanceId[]>>({}, true);
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
          addDatasetName(this.name),
          this.#backend.backendType === BackendType.Memory && imageData2DataURL,
        ].filter((x) => !!x),
        find: [limitToDataset(this.name)],
        get: [limitToDataset(this.name)],
        update: [limitToDataset(this.name)],
        patch: [limitToDataset(this.name)],
        remove: [limitToDataset(this.name)],
      },
      after: {
        find: [this.#backend.backendType === BackendType.Memory && dataURL2ImageData].filter(
          (x) => !!x,
        ),
        get: [this.#backend.backendType === BackendType.Memory && dataURL2ImageData].filter(
          (x) => !!x,
        ),
      },
    });

    this.instanceService.find({ query: { $select: ['id', '_id', 'label'] } }).then(({ data }) => {
      this.$instances.set(data.map((x) => x.id));
      this.$classes.set(
        data.reduce((c: Record<string, InstanceId[]>, instance: Instance) => {
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

  async clear(): Promise<void> {
    const { data } = await this.instanceService.find({ query: { $select: ['id'] } });
    await Promise.all(data.map(({ id }) => this.instanceService.remove(id)));
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        count: this.$count,
        instances: this.$instances,
        instanceService: this.instanceService,
      },
    });
  }

  stop(): void {
    super.stop();
    this.#unsubscribe();
  }
}
