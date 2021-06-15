import { Component } from '../../core/component';
import type { Dataset } from '../../dataset';
import type { ObjectId } from '../../core/types';
import { Stream } from '../../core/stream';
import View from './dataset-browser.view.svelte';

export class DatasetBrowser<InputType> extends Component {
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
    this.$$.app = new View({
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
