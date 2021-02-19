import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { chart, Chart } from '../chart';
import Component from './training-plot.svelte';
import { throwError } from '../../utils/error-handling';
import { Model } from '../../core';

export type LogSpec = string | string[] | { [key: string]: string | string[] };

export class TrainingPlot extends Module {
  title = 'training plot';

  charts: { [key: string]: Chart } = {};

  constructor(
    public model: Model,
    logs: LogSpec = {
      loss: ['loss', 'lossVal'],
      accuracy: ['accuracy', 'accuracyVal'],
    },
  ) {
    super();
    if (!model) {
      const e = new Error('[training plot] No model was provided');
      e.name = 'Module Compatibility Error';
      throwError(e);
    }
    if (!model.$training) {
      const e = new Error(
        '[training plot] The provided model is incompatible with the training plot module, missing `$training` stream',
      );
      e.name = 'Module Compatibility Error';
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
      [key: string]: Stream<number[]>;
    } = {};
    Object.entries(processedLogs).forEach(([key, val]) => {
      const x = Array.isArray(val) ? val : [val];
      this.charts[key] = chart({
        preset: 'line-fast',
        options: {
          xlabel: 'Epoch',
          ylabel: key,
        },
      });
      x.forEach((y) => {
        if (!Object.keys(streams).includes(y)) {
          streams[y] = new Stream<number[]>([], true);
        }
        this.charts[key].addSeries(streams[y], y);
      });
      this.charts[key].title = key;
    });

    function resetCharts() {
      Object.values(streams).forEach((stream) => {
        stream.set([]);
      });
    }

    model.$training.subscribe((x) => {
      if (x.status === 'start') {
        resetCharts();
      } else if (x.data) {
        Object.entries(x.data).forEach(([key, val]) => {
          if (!Object.keys(streams).includes(key)) return;
          if (Array.isArray(val)) {
            streams[key].set(val as number[]);
          } else {
            streams[key].set(streams[key].value.concat([val as number]));
          }
        });
      }
    });
    this.start();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        charts: this.charts,
      },
    });
  }
}
