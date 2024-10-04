import type { Instance, Model, TrainingStatus } from '../../core';
import { Component } from '../../core/component';
import { genericChart, type GenericChart } from '../generic-chart';
import { throwError } from '../../utils/error-handling';
import View from './training-plot.view.svelte';
import { BehaviorSubject } from 'rxjs';
import type { ChartPoint } from '../generic-chart/generic-chart.component';

export type LogSpec = string | string[] | Record<string, string | string[]>;

export class TrainingPlot extends Component {
  title = 'training plot';

  charts: Record<string, GenericChart> = {};

  constructor(
    public model: Model<Instance, unknown>,
    logs: LogSpec = {
      loss: ['loss', 'lossVal'],
      accuracy: ['acc', 'accVal'],
    },
  ) {
    super();
    if (!model) {
      const e = new Error('[training plot] No model was provided');
      e.name = 'Component Compatibility Error';
      throwError(e);
    }
    if (!model.$training) {
      const e = new Error(
        '[training plot] The provided model is incompatible with the training plot component, missing `$training` stream',
      );
      e.name = 'Component Compatibility Error';
      throwError(e);
    }
    let processedLogs = logs;
    if (typeof logs === 'string') {
      processedLogs = [logs];
    }
    if (Array.isArray(processedLogs)) {
      processedLogs = processedLogs.reduce((x, y) => ({ ...x, [y]: y }), {});
    }
    const streams: Record<string, BehaviorSubject<ChartPoint[]>> = {};
    for (const [key, val] of Object.entries(processedLogs)) {
      const x = Array.isArray(val) ? val : [val];
      this.charts[key] = genericChart({
        preset: 'line-fast',
        options: {
          xlabel: 'Epoch',
          ylabel: key,
        },
      });
      for (const y of x) {
        if (!Object.keys(streams).includes(y)) {
          streams[y] = new BehaviorSubject<ChartPoint[]>([]);
        }
        this.charts[key].addSeries(streams[y], y);
      }

      this.charts[key].title = key;
    }

    function resetCharts() {
      for (const stream of Object.values(streams)) {
        stream.next([]);
      }
    }

    model.$training.subscribe((x: TrainingStatus) => {
      if (x.status === 'start') {
        resetCharts();
      } else if (x.data) {
        for (const [key, val] of Object.entries(x.data)) {
          if (!Object.keys(streams).includes(key)) return;
          if (Array.isArray(val)) {
            streams[key].next((val as number[]).map((y, j) => ({ x: j + 1, y })));
          } else {
            streams[key].next(
              streams[key]
                .getValue()
                .concat([{ x: streams[key].getValue().length + 1, y: val as number }]),
            );
          }
        }
      }
    });
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        charts: this.charts,
      },
    });
  }
}
