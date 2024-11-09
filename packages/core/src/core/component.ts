import autoBind from 'auto-bind';
import type { ComponentInternals } from './types';
import { BehaviorSubject } from 'rxjs';
import { unmount } from 'svelte';

let nextId = 0;

export abstract class Component {
  public abstract title: string;

  id = `component-${String(nextId++).padStart(3, '0')}`;

  $loading = new BehaviorSubject(false);

  $$: ComponentInternals = {
    app: undefined,
  };

  constructor() {
    autoBind(this);
  }

  abstract mount(target?: HTMLElement): void;

  destroy(): void {
    if (this.$$.app) {
      unmount(this.$$.app);
    }
    this.$$.app = undefined;
  }

  dispose(): void {
    this.destroy();
  }
}
