import { Module } from '../../core/module';
import Component from './slider.svelte';
import { Stream } from '../../core/stream';

export interface SliderOptions {
  values: number[];
  min: number;
  max: number;
  step: number;
  range: boolean | 'min' | 'max';
  float: boolean;
  vertical: boolean;
  pips: boolean;
  pipstep: number;
  formatter: (x: unknown) => unknown;
}

export class Slider extends Module {
  name = 'slider';

  $values: Stream<number[]>;
  $min: Stream<number>;
  $max: Stream<number>;
  $step: Stream<number>;
  range: boolean | 'min' | 'max';
  float: boolean;
  vertical: boolean;
  pips: boolean;
  pipstep: number;
  formatter: (x: unknown) => unknown;
  constructor({
    values = [0.2],
    min = 0,
    max = 1,
    step = 0.01,
    range = 'min',
    float = true,
    vertical = false,
    pips = false,
    pipstep = undefined,
    formatter = (x) => x,
  }: Partial<SliderOptions> = {}) {
    super();
    this.$values = new Stream(values, true);
    this.$min = new Stream(min, true);
    this.$max = new Stream(max, true);
    this.$step = new Stream(step, true);
    this.range = range;
    this.float = float;
    this.vertical = vertical;
    this.pips = pips;
    this.pipstep = pipstep !== undefined ? pipstep : 10 / (max - min);
    this.formatter = formatter;
    this.start();
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.name,
        values: this.$values,
        min: this.$min,
        max: this.$max,
        step: this.$step,
        range: this.range,
        float: this.float,
        vertical: this.vertical,
        pips: this.pips,
        pipstep: this.pipstep,
        formatter: this.formatter,
      },
    });
  }
}
