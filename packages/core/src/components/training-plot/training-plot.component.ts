import type { Instance, Model, TrainingStatus } from '../../core';
import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import { genericChart, GenericChart } from '../generic-chart';
import { throwError } from '../../utils/error-handling';
import View from './training-plot.view.svelte';

export type LogSpec = string | string[] | { [key: string]: string | string[] };

export class TrainingPlot extends Component {
  title = 'training plot';

  charts: { [key: string]: GenericChart } = {};

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
    const streams: {
      [key: string]: Stream<{ x: number; y: number }[]>;
    } = {};
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
          streams[y] = new Stream<{ x: number; y: number }[]>([], true);
        }
        this.charts[key].addSeries(streams[y], y);
      }

      this.charts[key].title = key;
    }

    function resetCharts() {
      for (const stream of Object.values(streams)) {
        stream.set([]);
      }
    }

    model.$training.subscribe((x: TrainingStatus) => {
      if (x.status === 'start') {
        resetCharts();
      } else if (x.data) {
        for (const [key, val] of Object.entries(x.data)) {
          if (!Object.keys(streams).includes(key)) return;
          if (Array.isArray(val)) {
            streams[key].set((val as number[]).map((y, j) => ({ x: j + 1, y })));
          } else {
            streams[key].set(
              streams[key].get().concat([{ x: streams[key].get().length + 1, y: val as number }]),
            );
          }
        }
      }
    });
    this.start();
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
