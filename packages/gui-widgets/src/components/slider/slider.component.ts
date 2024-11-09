import { BehaviorSubject } from 'rxjs';
import { Component, rxBind } from '@marcellejs/core';
import View from './slider.view.svelte';
import { mount } from "svelte";

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
  formatter: (x: number) => unknown;
  continuous: boolean;
}

function round(value: number, exp: number): number {
  if (typeof exp === 'undefined' || +exp === 0) return Math.round(value);

  let v = +value;
  const e = +exp;

  if (isNaN(v) || !(typeof e === 'number' && e % 1 === 0)) return NaN;

  // Shift
  let vv = v.toString().split('e');
  v = Math.round(+(vv[0] + 'e' + (vv[1] ? +vv[1] + e : e)));

  // Shift back
  vv = v.toString().split('e');
  return +(vv[0] + 'e' + (vv[1] ? +vv[1] - e : -e));
}

export class Slider extends Component {
  title = 'slider';

  $values: BehaviorSubject<number[]>;
  $min: BehaviorSubject<number>;
  $max: BehaviorSubject<number>;
  $step: BehaviorSubject<number>;
  range: boolean | 'min' | 'max';
  float: boolean;
  vertical: boolean;
  pips: boolean;
  pipstep: number;
  formatter: (x: number) => unknown;
  continuous: boolean;
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
    formatter = (x: number) => round(x, 3),
    continuous = true,
  }: Partial<SliderOptions> = {}) {
    super();
    this.$values = new BehaviorSubject(values);
    this.$min = new BehaviorSubject(min);
    this.$max = new BehaviorSubject(max);
    this.$step = new BehaviorSubject(step);
    this.range = range;
    this.float = float;
    this.vertical = vertical;
    this.pips = pips;
    this.pipstep = pipstep !== undefined ? pipstep : Math.floor((max - min) / (10 * step));
    this.formatter = formatter;
    this.continuous = continuous;
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = mount(View, {
          target: t,
          props: {
            values: rxBind(this.$values),
            min: this.$min,
            max: this.$max,
            step: this.$step,
            range: this.range,
            float: this.float,
            vertical: this.vertical,
            pips: this.pips,
            pipstep: this.pipstep,
            formatter: this.formatter,
            continuous: this.continuous,
          },
        });
  }
}
