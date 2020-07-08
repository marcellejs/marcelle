import { Module } from '../../core/module';
import { active, stream, tensors, thumbnails } from './webcam.store';
import component from './webcam.svelte';

export class Webcam extends Module {
  name = 'webcam';
  description = 'Webcam input module';
  component = component;

  constructor() {
    super();
    this.defineProp('stream', stream, false);
    this.out.active = active;
    this.out.tensors = tensors;
    this.out.thumbnails = thumbnails;
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
