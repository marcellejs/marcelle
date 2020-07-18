import { map, skipRepeatsWith } from '@most/core';
import dequal from 'dequal';
import { Module } from '../../core/module';
import Component from './dataset.svelte';
import { Stream } from '../../core/stream';

export interface DatasetOptions {
  name: string;
}

export interface Instance {
  id?: number;
  label: string;
  data: unknown;
  thumbnail?: string;
  features?: number[][];
}

export class Dataset extends Module {
  name = 'dataset';
  description = 'Dataset';

  #unsubscribe: () => void;
  #instanceData: Record<string, Instance> = {};

  #nextId = 0;

  $instances: Stream<number[]> = new Stream([], true);
  $classes = new Stream<Record<string, number[]>>({}, true);
  $labels: Stream<string[]>;
  $count = new Stream(0, true);

  constructor({ name }: DatasetOptions) {
    super();
    this.name = name;
    this.$classes.set(
      Object.values(this.#instanceData).reduce(
        (c: Record<string, number[]>, instance: Instance) => {
          const x = Object.keys(c).includes(instance.label) ? c[instance.label] : [];
          return { ...c, [instance.label]: x.concat([instance.id]) };
        },
        {},
      ),
    );
    this.$labels = new Stream(skipRepeatsWith(dequal, map(Object.keys, this.$classes)));
    this.start();
  }

  capture(instanceStream: Stream<Instance>): void {
    this.#unsubscribe = instanceStream.subscribe((instance: Instance) => {
      if (!instance) return;
      const id = this.#nextId++;
      this.#instanceData[id] = { ...instance, id };
      const x = Object.keys(this.$classes.value).includes(instance.label)
        ? this.$classes.value[instance.label]
        : [];
      this.$classes.set({ ...this.$classes.value, [instance.label]: [...x, id] });
      this.$instances.set([...this.$instances.value, id]);
    });
  }

  forEach(callback: (instance: Instance, index: number) => void): void {
    this.$instances.value.forEach((id, i) => {
      callback(this.#instanceData[id], i);
    });
  }

  getInstance(id: number): Instance {
    return this.#instanceData[id];
  }

  mount(targetId?: string): void {
    const target = document.querySelector(`#${targetId || this.id}`);
    if (!target || !Component) return;
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        count: this.$count,
        instances: this.$instances,
        instanceData: this.#instanceData,
      },
    });
  }

  stop(): void {
    super.stop();
    this.#unsubscribe();
  }
}
