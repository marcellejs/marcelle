import { Module } from '../core/module';
import { click } from './button.store';
import component from './button.svelte';

interface ButtonOption extends Record<string, unknown> {
  text?: string;
}

export class Button extends Module {
  name = 'button';
  description = 'just a button...';
  component = component;

  constructor(options: ButtonOption = { text: 'click me' }) {
    super(options);
    Object.defineProperty(this.props, 'text', {
      get: () => this.app?.text,
      set: (v: string) => {
        this.app?.$set({ text: v });
      },
    });
    this.out.click = click;
    this.setup();
  }

  protected mount(): void {
    const target = document.querySelector(`#${this.id}`);
    if (!target) return;
    this.app = new component({
      target,
      props: {
        text: this.options.text,
      },
    });
  }
}
