import { Module } from '../../core/module';
import { frames, size as sizeObs } from './faker.store';
import component from './faker.svelte';

export class Faker extends Module {
  name = 'faker';
  description = 'Fake data input module';
  component = component;

  constructor({ size = 32 } = {}) {
    super();
    this.defineProp('size', sizeObs, size);
    this.out.frames = frames;
  }

  protected mount(): void {
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
