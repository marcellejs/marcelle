import { Writable, Readable } from 'svelte/store';
import { Module } from '../../core/module';
import {
  capturing,
  instances,
  setInputStream,
  setThumbnailStream,
  temporal as temporalStream,
} from './capture.store';
import component from './capture.svelte';

type Stream = Writable<unknown[]> | Readable<unknown[]>;
export interface CaptureOptions {
  input: Stream;
  thumbnail?: Stream;
  temporal: boolean;
}

export class Capture extends Module {
  name = 'capture';
  description = 'Capture an input stream to a dataset';
  component = component;

  constructor({ input, thumbnail, temporal = false }: CaptureOptions) {
    super();
    thumbnail && setThumbnailStream(thumbnail);
    setInputStream(input);
    this.defineProp('capturing', capturing, false);
    this.defineProp('temporal', temporalStream, temporal);
    this.out.instances = instances;
  }

  mount(): void {
    const target = document.querySelector(`#${this.id}`);
    if (!target) return;
    this.app = new component({
      target,
      props: {
        title: this.name,
      },
    });
  }
}
