import { map, skipRepeatsWith } from '@most/core';
import dequal from 'dequal';
import { Module } from '../../core/module';
import Component from './dataset.svelte';
import { Stream } from '../../core/stream';
import { Instance, InstanceId } from './dataset.common';
import { InMemoryBackend } from './dataset_backend';

export interface DatasetOptions {
  name: string;
  backend: InMemoryBackend;
}

export class Dataset extends Module {
  name = 'dataset';
  description = 'Dataset';

  #unsubscribe: () => void;
  #backend: InMemoryBackend;

  $instances: Stream<InstanceId[]> = new Stream([], true);
  $classes = new Stream<Record<string, InstanceId[]>>({}, true);
  $labels: Stream<string[]>;
  $count: Stream<number>;
  $countPerClass: Stream<Record<string, number>>;

  constructor({ name, backend }: DatasetOptions) {
    super();
    this.name = name;
    this.#backend = backend || new InMemoryBackend();
    // this.$classes.set(
    //   Object.values(this.#instanceData).reduce(
    //     (c: Record<string, number[]>, instance: Instance) => {
    //       const x = Object.keys(c).includes(instance.label) ? c[instance.label] : [];
    //       return { ...c, [instance.label]: x.concat([instance.id]) };
    //     },
    //     {},
    //   ),
    // );
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
    this.#unsubscribe = instanceStream.subscribe((instance: Instance) => {
      if (!instance) return;
      const id = this.#backend.addInstance(instance);
      const x = Object.keys(this.$classes.value).includes(instance.label)
        ? this.$classes.value[instance.label]
        : [];
      this.$classes.set({ ...this.$classes.value, [instance.label]: [...x, id] });
      this.$instances.set([...this.$instances.value, id]);
    });
  }

  // forEach(callback: (instance: Instance, index: number) => void): void {
  //   this.$instances.value.forEach((id, i) => {
  //     callback(this.#instanceData[id], i);
  //   });
  // }

  getInstance(id: InstanceId): Instance {
    return this.#backend.getInstance(id);
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
        instanceData: this.#backend.instanceData,
      },
    });
  }

  stop(): void {
    super.stop();
    this.#unsubscribe();
  }
}
