import type { Stream } from '../../core/stream';
import { Component } from '../../core/component';
import View from './scatter-plot.view.svelte';

export class ScatterPlot extends Component {
  title = 'Scatter plot';

  $data: Stream<number[][]>;
  $labels: Stream<number[] | string[]>;

  constructor(dataset: Stream<number[][]>, labels: Stream<string[] | number[]>) {
    super();
    this.$data = dataset.hold();
    this.$labels = labels.hold();
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
        embedding: this.$data,
        labels: this.$labels,
      },
    });
  }
}
