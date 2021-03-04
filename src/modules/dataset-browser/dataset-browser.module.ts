import { Module } from '../../core/module';
import Component from './dataset-browser.svelte';
import { Dataset } from '../dataset';
import { ObjectId, Stream } from '../../core';

export class DatasetBrowser extends Module {
  title = 'dataset browser';

  #dataset: Dataset;
  $selected: Stream<ObjectId[]> = new Stream([], true);

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
        selected: this.$selected,
      },
    });
  }
}
