import { Module } from '../../core/module';
import Component from './toggle.svelte';
import { Stream } from '../../core/stream';

export interface ToggleOptions {
  text: string;
}

export class Toggle extends Module {
  title = 'toggle';

  $text: Stream<string>;
  $checked = new Stream(false, true);
  $disabled = new Stream(false, true);

  constructor({ text = 'toggle me' }: Partial<ToggleOptions> = {}) {
    super();
    this.$text = new Stream(text, true);
    this.start();
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.title,
        text: this.$text,
        checked: this.$checked,
        disabled: this.$disabled,
      },
    });
  }
}
