import { BehaviorSubject, Observable } from 'rxjs';
import { Component } from '../../core/component';
import View from './scatter-plot.view.svelte';

export class ScatterPlot extends Component {
  title = 'Scatter plot';

  $data = new BehaviorSubject<number[][]>([]);
  $labels = new BehaviorSubject<number[] | string[]>([]);

  constructor(dataset: Observable<number[][]>, labels: Observable<string[] | number[]>) {
    super();
    dataset.subscribe(this.$data);
    labels.subscribe(this.$labels);
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
        labels: this.$labels as BehaviorSubject<number[]>,
      },
    });
  }
}
