import { ChartOptions as ChartJsOptions } from 'chart.js';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { throwError } from '../../utils/error-handling';
import Component from './chart.svelte';

// TODO: update view when series are added or removed
// TODO: Automatic switch to fast mode when high number of points

const presets = {
  line: {
    global: {
      type: 'line',
      options: {
        animation: { duration: 200 },
        scales: {
          x: {
            ticks: {
              sampleSize: 11,
            },
          },
        },
      },
    },
    datasets: {
      fill: false,
      lineTension: 0.2,
    },
  },
  'line-fast': {
    global: {
      type: 'line',
      options: {
        elements: {
          point: {
            radius: 0,
          },
        },
        animation: false,
        tooltips: false,
        spanGaps: true,
        scales: {
          x: {
            ticks: {
              sampleSize: 11,
            },
          },
        },
      },
    },
    datasets: {
      fill: false,
      lineTension: 0,
    },
  },
  bar: {
    global: {
      type: 'bar',
      options: {
        animation: { duration: 200 },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    },
  },
  'bar-fast': {
    global: {
      type: 'bar',
      options: {
        animation: false,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    },
  },
};

export interface ChartOptions {
  preset?: 'line' | 'line-fast' | 'bar' | 'bar-fast';
  options?: ChartJsOptions & { xlabel?: string; ylabel?: string };
}

export interface ChartDataset {
  dataStream: Stream<number[] | Array<{ x: unknown; y: unknown }>>;
  label: string;
  options: { type?: string; labels?: string[]; [key: string]: unknown };
}

export class Chart extends Module {
  name = 'chart';
  description = 'Simple chart based on Chart.js';

  #presetName: string;
  #preset: { global: Record<string, unknown>; datasets?: Record<string, unknown> };
  #datasets: Array<ChartDataset> = [];
  #options: ChartJsOptions & { xlabel?: string; ylabel?: string };

  constructor({ preset = 'line', options = {} }: ChartOptions = {}) {
    super();
    if (!Object.keys(presets).includes(preset)) {
      throwError(new Error(`Preset ${preset} is not recognized`));
    }
    this.#presetName = preset;
    this.#preset = presets[preset];
    this.#options = options;
    this.start();
  }

  addSeries(
    dataStream: Stream<number[] | Array<{ x: unknown; y: unknown }>>,
    label: string,
    options: Record<string, unknown> = {},
  ): void {
    if (this.#presetName === 'line-fast') {
      const throttledStream = dataStream.throttle(100);
      throttledStream.value = dataStream.value;
      this.#datasets.push({
        dataStream: throttledStream,
        label,
        options,
      });
    } else {
      this.#datasets.push({ dataStream, label, options });
    }
  }

  removeSeries(dataStream: Stream<number[] | Array<{ x: unknown; y: unknown }>>): void {
    const index = this.#datasets.map((x) => x.dataStream).indexOf(dataStream);
    if (index > -1) {
      this.#datasets.splice(index, 1);
    }
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        preset: this.#preset,
        options: this.#options,
        datasets: this.#datasets,
      },
    });
  }
}
