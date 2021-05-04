import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import Component from './scatter.svelte';

export class ScatterPlot extends Module {
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
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        embedding: this.$data,
        labels: this.$labels,
      },
    });
  }
}
