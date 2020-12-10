import { Module } from '../../core/module';
import Component from './browser.svelte';
import { Dataset } from '../dataset';

export class Browser extends Module {
  title = 'dataset browser';

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
        title: this.title,
        count: this.#dataset.$count,
        classes: this.#dataset.$classes,
        dataset: this.#dataset,
      },
    });
  }
}
