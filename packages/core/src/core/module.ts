// import { runEffects } from '@most/core';
// import { Stream, Scheduler } from '@most/types';
// import { tap, multicast } from '@most/core';
// import { createAdapter } from '@most/adapter';
// import Vue from 'vue';
// import { CombinedVueInstance, VueConstructor } from 'vue/types/vue';

import { Writable } from 'svelte/store';
import { SvelteComponent } from 'svelte';

export abstract class Module {
  static moduleId = 0;
  static readonly isModule = true;
  static readonly moduleType = 'generic';

  public abstract name: string;
  public abstract description: string;

  id: string;

  props: Record<string, unknown> = {};
  propValues: Record<string, unknown> = {};
  out: Record<string, Writable<unknown>> = {};

  protected component: unknown = undefined;
  protected app: SvelteComponent | undefined = undefined;

  protected abstract mount(): void;

  constructor() {
    this.id = `module-${String(Module.moduleId++).padStart(3, '0')}`;
  }

  run(): void {
    this.mount();
  }

  protected defineProp<T>(name: string, obs: Writable<T>, initialValue: T): void {
    Object.defineProperty(this.props, name, {
      get: () => this.propValues[name],
      set: (v: T) => {
        obs.set(v);
      },
    });
    obs.subscribe((v: T) => {
      this.propValues[name] = v;
    });
    this.props[name] = initialValue;
  }
}
