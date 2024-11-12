import type { ChartOptions as ChartJsOptions } from 'chart.js';
import type { ServiceIterable } from '../../core/data-store/service-iterable';
import { Component } from '../../core/component';
import { throwError } from '../../utils/error-handling';
import View from './generic-chart.view.svelte';
import { BehaviorSubject, Observable, auditTime, isObservable } from 'rxjs';
import { mount, unmount } from 'svelte';

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
  scatter: {
    global: {
      type: 'scatter',
      options: {
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
          },
        },
      },
    },
  },
};

export interface GenericChartOptions {
  preset?: 'line' | 'line-fast' | 'bar' | 'bar-fast' | 'scatter';
  options?: ChartJsOptions & { xlabel?: string; ylabel?: string };
}

export type ChartPoint = number | { x: unknown; y: unknown };

export interface ChartDataset {
  dataStream: BehaviorSubject<ChartPoint[]>;
  label: string;
  options: { type?: string; labels?: string[]; [key: string]: unknown };
}

export class GenericChart extends Component {
  title = 'generic chart';

  #presetName: string;
  #preset: { global: Record<string, unknown>; datasets?: Record<string, unknown> };
  #datasets = new BehaviorSubject<ChartDataset[]>([]);
  options: ChartJsOptions & { xlabel?: string; ylabel?: string };

  constructor({ preset = 'line', options = {} }: GenericChartOptions = {}) {
    super();
    if (!Object.keys(presets).includes(preset)) {
      throwError(new Error(`Preset ${preset} is not recognized`));
    }
    this.#presetName = preset;
    this.#preset = presets[preset];
    this.options = options;
  }

  addSeries(
    series: Observable<ChartPoint[]> | ServiceIterable<ChartPoint>,
    label: string,
    options: Record<string, unknown> = {},
  ): void {
    if (isObservable(series)) {
      const points = new BehaviorSubject<ChartPoint[]>(
        typeof (series as BehaviorSubject<ChartPoint[]>).getValue === 'function'
          ? (series as BehaviorSubject<ChartPoint[]>).getValue()
          : [],
      );
      if (this.#presetName === 'line-fast') {
        series.pipe(auditTime(10)).subscribe(points);
      } else {
        series.subscribe(points);
      }
      this.#datasets.next([...this.#datasets.getValue(), { dataStream: points, label, options }]);
    } else {
      series.toArray().then((values) => {
        const dataStream = new BehaviorSubject(values);
        this.#datasets.next([...this.#datasets.getValue(), { dataStream, label, options }]);
      });
    }
  }

  setColors(colorStream: BehaviorSubject<number[]>): void {
    const d = this.#datasets.getValue();
    d[0].label = 'clusters';
    d[0].options.backgroundColor = colorStream.getValue();
    d[0].options.color = colorStream.getValue(); //alternatePointStyles;
    this.#datasets.next(d);
  }

  removeSeries(dataStream: BehaviorSubject<ChartPoint[]>): void {
    const index = this.#datasets
      .getValue()
      .map((x) => x.dataStream)
      .indexOf(dataStream);
    if (index > -1) {
      const d = this.#datasets.getValue();
      d.splice(index, 1);
      this.#datasets.next(d);
    }
  }

  clear(): void {
    this.#datasets.next([]);
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        preset: this.#preset,
        options: this.options,
        datasets: this.#datasets,
      },
    });
    return () => unmount(app);
  }
}
