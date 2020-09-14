import { ApexOptions } from 'apexcharts';
import { Module } from '../../core/module';
import Component from './plotter.svelte';
import { Stream } from '../../core/stream';

// export interface PlotsOptions {
//   text: string;
// }

type PlotterSeries = Array<{
  name: string;
  data: Stream<number[]> | Stream<{ x: string; y: number }[]>;
}>;

export interface PlotterOptions {
  series?: PlotterSeries;
  options?: ApexOptions;
}

export class Plotter extends Module {
  name = 'plots';
  description = 'plots from apexchart';

  series: PlotterSeries;
  #options: ApexOptions;

  constructor({ series = [], options = {} }: PlotterOptions) {
    super();
    this.series = series;
    this.#options = options;
    this.start();
  }

  // plotting(inputs: { name: string; data: number[] }[]): void {
  //   for (let i = 0; i < inputs.length; i++) {
  //     const x = this.$options.value;
  //     if (x.series.length < i) {
  //       x.series.push(inputs[i]);
  //     } else {
  //       x.series[i] = inputs[i];
  //     }
  //     this.$options.set(x);
  //   }
  // }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        options: this.#options,
        series: this.series,
      },
    });
  }
}
