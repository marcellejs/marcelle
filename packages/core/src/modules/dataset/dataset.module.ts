import { Module } from '../../core/module';
import component from './dataset.svelte';
import { setInstanceStream, Instance, Stream } from './dataset.store';

export interface DatasetOptions {
  name: string;
}

export class Dataset extends Module {
  name = 'dataset';
  description = 'Dataset';
  component = component;

  constructor({ name }: DatasetOptions) {
    super();
    this.name = name;
  }

  capture(instanceStream: Stream<Instance>): void {
    setInstanceStream(instanceStream);
  }

  mount(): void {
    const target = document.querySelector(`#${this.id}`);
    if (!target || !this.component) return;
    this.app = new this.component({
      target,
      props: {
        title: this.name,
      },
    });
  }
}
