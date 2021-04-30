import { Module } from '../../core/module';
import Component from './dataset-browser.svelte';
import type { Dataset } from '../../dataset';
import { ObjectId, Stream } from '../../core';

export class DatasetBrowser<InputType> extends Module {
  title = 'dataset browser';

  #dataset: Dataset<InputType, string>;
  $selected: Stream<ObjectId[]> = new Stream([], true);

  constructor(dataset: Dataset<InputType, string>) {
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
        dataset: this.#dataset,
        selected: this.$selected,
      },
    });
  }
}
