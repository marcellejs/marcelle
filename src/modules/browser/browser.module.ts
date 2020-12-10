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

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        count: this.#dataset.$count,
        classes: this.#dataset.$classes,
        dataset: this.#dataset,
      },
    });
  }
}
