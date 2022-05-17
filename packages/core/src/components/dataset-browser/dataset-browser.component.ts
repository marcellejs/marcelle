import { Component } from '../../core/component';
import type { Dataset, Instance } from '../../core';
import type { ObjectId } from '../../core/types';
import { Stream } from '../../core/stream';
import View from './dataset-browser.view.svelte';

export interface DBInstance extends Instance {
  y: string;
}

interface DatasetBrowserOptions {
  batchSize: number;
}
export class DatasetBrowser extends Component {
  title = 'dataset browser';

  #dataset: Dataset<DBInstance>;
  $selected: Stream<ObjectId[]> = new Stream([], true);

  batchSize: number;

  constructor(
    dataset: Dataset<DBInstance>,
    { batchSize = 6 }: Partial<DatasetBrowserOptions> = {},
  ) {
    super();
    this.#dataset = dataset;
    this.batchSize = batchSize;
    this.start();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        batchSize: this.batchSize,
        count: this.#dataset.$count,
        dataset: this.#dataset,
        selected: this.$selected,
      },
    });
  }
}
