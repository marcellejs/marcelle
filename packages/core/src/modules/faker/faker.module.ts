import { Module } from '../../core/module';
import { frames, size as sizeObs } from './faker.store';
import Component from './faker.svelte';

export class Faker extends Module {
  name = 'faker';
  description = 'Fake data input module';

  constructor({ size = 32 } = {}) {
    super();
    this.defineProp('size', sizeObs, size);
    this.out.frames = frames;
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
