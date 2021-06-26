import { Component, Dataset, Instance, Stream } from '../../core';
import View from './dataset-table.view.svelte';

export class DatasetTable<InputType, OutputType> extends Component {
  title = 'dataset table';

  #dataset: Dataset<InputType, OutputType>;
  $columns: Stream<string[]>;
  $selection: Stream<Instance<InputType, OutputType>[]> = new Stream([], true);

  singleSelection = false;

  constructor(
    dataset: Dataset<InputType, OutputType>,
    columns: string[] = ['x', 'y', 'thumbnail', 'updatedAt'],
    singleSelection = false,
  ) {
    super();
    this.#dataset = dataset;
    this.$columns = new Stream(columns, true);
    this.singleSelection = singleSelection;
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
        dataset: this.#dataset,
        colNames: this.$columns,
        singleSelection: this.singleSelection,
        selected: this.$selection,
      },
    });
  }
}
