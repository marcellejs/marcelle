import { empty, snapshot, combine, filter } from '@most/core';
import { Module } from '../../core/module';
import Component from './capture.svelte';
import { Stream } from '../../core/stream';

export interface CaptureOptions {
  input: Stream<unknown>;
  thumbnail?: Stream<string>;
  label?: Stream<string>;
}

interface Instance {
  data: unknown;
  thumbnail: string;
  label: string;
}

export class Capture extends Module {
  name = 'capture';
  description = 'Capture an input stream to a dataset';

  $label: Stream<string>;
  $thumbnail: Stream<string>;
  $capturing = new Stream(false);
  $instances: Stream<Instance>;

  // TODO: temporal mode
  constructor({ input, thumbnail = undefined, label = undefined }: CaptureOptions) {
    super();
    this.$thumbnail = thumbnail || new Stream(empty());
    this.$label = label || new Stream('default', true);
    this.$instances = new Stream(
      snapshot(
        (x: { thumbnail: string; label: string }, data) => ({ ...x, data }),
        combine(
          (t: string, l: string) => ({ thumbnail: t, label: l }),
          this.$thumbnail,
          this.$label,
        ),
        filter(() => this.$capturing.value, input),
      ),
    );

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
        capturing: this.$capturing,
        label: this.$label,
      },
    });
  }
}
