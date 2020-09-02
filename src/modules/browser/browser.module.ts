import { Module } from '../../core/module';
import Component from './browser.svelte';
import { Dataset } from '../dataset';

export class Browser extends Module {
  name = 'dataset browser';
  description = 'Browser a Dataset (of images...)';

  #dataset: Dataset;

  constructor(dataset: Dataset) {
    super();
    this.#dataset = dataset;
    this.start();
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        count: this.#dataset.$count,
        classes: this.#dataset.$classes,
        instanceService: this.#dataset.instanceService,
      },
    });
  }
}
