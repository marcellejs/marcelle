// import { empty } from '@most/core';
import { Module } from '../../core/module';
import Component from './plotter.svelte';
import { Stream } from '../../core/stream';

// export interface PlotsOptions {
//   text: string;
// }

export class Plotter extends Module {
  name = 'plots';
  description = 'plots from apexchart';

  $title: Stream<string>;
  $options: Stream<{ chart: {}, series: [{ name: string, data: number[] }] }>;

  // constructor(inputStreams: Stream<number[]>[], title: string) {
  constructor(title: string) {
    super();
    this.$title = new Stream(title, true);
    this.$options = new Stream({ chart: {}, series: [{ name: 'loss', data: [] }] }, true);
    this.start();
  }

  plotting(inputs: { name: string, data: number[] }[]): void {
    for (let i = 0; i < inputs.length; i++) {
      const x = this.$options.value;
      if (x.series.length < i) {
        x.series.push(inputs[i]);
      }
      else {
        x.series[i] = inputs[i];
      }
      this.$options.set(x);
      console.log(i, inputs.length, inputs);
    }
  }


  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);

    this.$options.set({
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        }
      },
      series: [
        {
          name: 'void',
          data: [],
        }],
    })

    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        options: this.$options,
      },
    });
  }

}
