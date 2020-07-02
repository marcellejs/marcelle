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

  protected abstract mount(): void;

  id: string;

  props: Record<string, unknown> = {};
  out: Record<string, Writable<unknown>> = {};

  protected component: unknown = undefined;
  protected app: SvelteComponent | undefined = undefined;
  // protected ui: // eslint-disable-next-line @typescript-eslint/ban-types
  // CombinedVueInstance<Vue, object, object, object, Record<string, unknown>> | undefined = undefined;
  // protected vue = Vue;
  // watchers: string[] = [];

  constructor(protected options: Record<string, unknown>) {
    this.id = `module-${String(Module.moduleId++).padStart(3, '0')}`;
  }

  setup(): void {
    // if (this.component) {
    //   this.ui = new this.component();
    //   this.watchers.forEach((w) => {
    //     this.wrapWatcher(w);
    //   });
    // }
  }

  run(): void {
    this.mount();
    // if (this.ui) {
    //   this.ui.$mount(`#${this.id}`);
    // }
    // Object.values(this.out).forEach((s) => {
    //   runEffects(s, scheduler);
    // });
  }

  protected wrapWatcher<T>(propertyName: string): void {
    // if (!this.ui) return;
    // const [induce, events] = createAdapter<T>();
    // induce(this.ui[propertyName] as T);
    // this.ui.$watch('active', (newVal: T) => {
    //   console.log(`[wrapWatcher]: ${propertyName} = ${newVal}`);
    //   induce(newVal);
    // });
    // this.out[`$${propertyName}`] = multicast(tap((x) => console.log('yo', x), events));
  }
}
