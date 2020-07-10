import { Module } from '../../core/module';
import Component from './dataset.svelte';
import { setInstanceStream, Instance, Stream, instances, count } from './dataset.store';

export interface DatasetOptions {
  name: string;
}

export class Dataset extends Module {
  name = 'dataset';
  description = 'Dataset';

  constructor({ name }: DatasetOptions) {
    super();
    this.name = name;
    this.out.instances = instances;
    this.out.count = count;
  }

  // eslint-disable-next-line class-methods-use-this
  capture(instanceStream: Stream<Instance>): void {
    setInstanceStream(instanceStream);
  }

  mount(): void {
    const target = document.querySelector(`#${this.id}`);
    if (!target || !Component) return;
    this.app = new Component({
      target,
      props: {
        title: this.name,
      },
    });
  }
}
