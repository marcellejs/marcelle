import type { ChartConfiguration } from 'chart.js';
import colorLib from '@kurkle/color';
import { Component, type Dataset, type Instance, Stream, ObjectId } from '../../core';
import View from './dataset-scatter.view.svelte';

const defaultColors = [
  'rgb(54, 162, 235)',
  'rgb(255, 99, 132)',
  'rgb(255, 206, 86)',
  'rgb(75, 192, 192)',
  'rgb(153, 102, 255)',
  'rgb(255, 159, 64)',
];

export interface Transforms<T extends Instance> {
  xy: (value: T) => [number, number] | Promise<[number, number]>;
  label: (value: T) => number | string | Promise<number | string>;
}

export class DatasetScatter<T extends Instance> extends Component {
  title = 'Dataset ScatterPlot';
  transforms: Transforms<T> = {
    xy: (value: T) => [value.x[0], value.x[1]],
    label: (value: T) => value.y,
  };

  $data = new Stream<ChartConfiguration['data']>(undefined, true);
  $hovered: Stream<ObjectId[]> = new Stream([], true);
  $clicked: Stream<ObjectId[]> = new Stream([], true);

  constructor(private dataset: Dataset<T>) {
    super();
    this.dataset.ready.then(() => {
      this.updateData();
    });
  }

  setTransforms(t: Partial<Transforms<T>>) {
    this.transforms = { ...this.transforms, ...t };
    this.updateData();
  }

  async updateData(): Promise<void> {
    await this.dataset.ready;
    const values = await Promise.all(
      await this.dataset
        .items()
        .map(async (instance) => {
          const [x, y] = await this.transforms.xy(instance);
          const label = await this.transforms.label(instance);
          return {
            x,
            y,
            label,
            id: instance.id,
            thumbnail: instance.thumbnail,
          };
        })
        .toArray(),
    );
    const labels = values.map((x) => x.label);
    const uniqueLabels = Array.from(new Set(labels));
    uniqueLabels.sort();
    const data: ChartConfiguration['data'] = {
      labels,
      datasets: uniqueLabels.map((label, i) => ({
        label: label as string,
        data: values.filter((v) => v.label === label),
        borderColor: colorLib(defaultColors[i]).darken(0.5).rgbString(),
        backgroundColor: defaultColors[i],
      })),
    };
    this.$data.set(data);
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        data: this.$data,
        hovered: this.$hovered,
        clicked: this.$clicked,
      },
    });
  }
}
