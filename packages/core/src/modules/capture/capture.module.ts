import { Writable, Readable } from 'svelte/store';
import { Module } from '../../core/module';
import { capturing, instances, setInputStream, setThumbnailStream } from './capture.store';
import component from './capture.svelte';

type Stream = Writable<unknown[]> | Readable<unknown[]>;
export interface CaptureOptions {
  input: Stream;
  thumbnail?: Stream;
}

export class Capture extends Module {
  name = 'capture';
  description = 'Capture an input stream to a dataset';
  component = component;

  constructor({ input, thumbnail }: CaptureOptions) {
    super();
    thumbnail && setThumbnailStream(thumbnail);
    setInputStream(input);
    this.defineProp('capturing', capturing, false);
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
