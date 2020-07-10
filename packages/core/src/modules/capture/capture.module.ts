import { Writable, Readable } from 'svelte/store';
import { Observable } from 'rxjs';
import { Module } from '../../core/module';
import {
  capturing,
  instances,
  setInputStream,
  setThumbnailStream,
  temporal as temporalStream,
} from './capture.store';
import Component from './capture.svelte';

type Stream = Writable<unknown> | Readable<unknown> | Observable<unknown>;
export interface CaptureOptions {
  input: Writable<unknown> | Readable<unknown>;
  thumbnail?: Stream;
  temporal: boolean;
}

export class Capture extends Module {
  name = 'capture';
  description = 'Capture an input stream to a dataset';

  constructor({ input, thumbnail, temporal = false }: CaptureOptions) {
    super();
    if (thumbnail) setThumbnailStream(thumbnail);
    setInputStream(input);
    this.defineProp('capturing', capturing, false);
    this.defineProp('temporal', temporalStream, temporal);
    this.out.instances = instances;
  }

  mount(): void {
    const target = document.querySelector(`#${this.id}`);
    if (!target) return;
    this.app = new Component({
      target,
      props: {
        title: this.name,
      },
    });
  }
}
