import { Component } from '../../core/component';
import type { Dataset, Instance } from '../../core';
import type { ObjectId } from '../../core/types';
import View from './dataset-browser.view.svelte';
import { BehaviorSubject } from 'rxjs';
import { mount } from "svelte";

export interface DBInstance extends Instance {
  y: string;
}

interface DatasetBrowserOptions {
  batchSize: number;
}
export class DatasetBrowser extends Component {
  title = 'dataset browser';

  #dataset: Dataset<DBInstance>;
  $selected = new BehaviorSubject<ObjectId[]>([]);

  batchSize: number;

  constructor(
    dataset: Dataset<DBInstance>,
    { batchSize = 6 }: Partial<DatasetBrowserOptions> = {},
  ) {
    super();
    this.#dataset = dataset;
    this.batchSize = batchSize;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = mount(View, {
          target: t,
          props: {
            batchSize: this.batchSize,
            count: this.#dataset.$count,
            dataset: this.#dataset,
            selected: this.$selected,
          },
        });
  }
}
