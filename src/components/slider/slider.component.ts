import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import View from './slider.view.svelte';

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

  $values: Stream<number[]>;
  $min: Stream<number>;
  $max: Stream<number>;
  $step: Stream<number>;
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
    this.$values = new Stream(values, true);
    this.$min = new Stream(min, true);
    this.$max = new Stream(max, true);
    this.$step = new Stream(step, true);
    this.range = range;
    this.float = float;
    this.vertical = vertical;
    this.pips = pips;
    this.pipstep = pipstep !== undefined ? pipstep : Math.floor((max - min) / (10 * step));
    this.formatter = formatter;
    this.continuous = continuous;
    this.start();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
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
        continuous: this.continuous,
      },
    });
  }
}
