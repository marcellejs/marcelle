import { map, skipRepeatsWith } from '@most/core';
import dequal from 'dequal';
import { Module } from '../../core/module';
import Component from './dataset.svelte';
import { Stream } from '../../core/stream';
import { Instance, InstanceId } from './dataset.common';
import { BaseBackend } from './base.backend';
import { MemoryBackend } from './memory.backend';
// import { DefaultBackend } from './default.backend';
import { LocalStorageBackend } from './localstorage.backend';

export interface DatasetOptions {
  name: string;
  backend: 'default' | 'localStorage';
}

export class Dataset extends Module {
  name = 'dataset';
  description = 'Dataset';

  #unsubscribe: () => void;
  backend: BaseBackend;

  $instances: Stream<InstanceId[]> = new Stream([], true);
  $classes = new Stream<Record<string, InstanceId[]>>({}, true);
  $labels: Stream<string[]>;
  $count: Stream<number>;
  $countPerClass: Stream<Record<string, number>>;

  constructor({ name, backend = 'default' }: DatasetOptions) {
    super();
    this.name = name;
    switch (backend) {
      case 'localStorage':
        this.backend = new LocalStorageBackend(name);
        break;
      default:
        this.backend = new MemoryBackend(name);
        break;
    }
    this.backend.instances.find({ query: { $select: ['id', 'label'] } }).then(({ data }) => {
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
      const { id } = await this.backend.instances.create(instance);
      const x = Object.keys(this.$classes.value).includes(instance.label)
        ? this.$classes.value[instance.label]
        : [];
      this.$classes.set({ ...this.$classes.value, [instance.label]: [...x, id] });
      this.$instances.set([...this.$instances.value, id]);
    });
  }

  async clear(): Promise<void> {
    const { data } = await this.backend.instances.find({ query: { $select: ['id'] } });
    await Promise.all(data.map(({ id }) => this.backend.instances.remove(id)));
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
        backend: this.backend,
      },
    });
  }

  stop(): void {
    super.stop();
    this.#unsubscribe();
  }
}
