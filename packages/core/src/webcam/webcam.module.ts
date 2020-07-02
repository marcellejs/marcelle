import { Module } from '../core/module';
import { active } from './webcam.store';
import component from './webcam.svelte';

export class Webcam extends Module {
  name = 'webcam';
  description = 'Webcam input module';
  component = component;
  // watchers = ['active'];

  constructor(options: Record<string, unknown>) {
    super(options);
    this.out.active = active;
    this.setup();
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
