import { Writable, Readable } from 'svelte/store';
import { SvelteComponent } from 'svelte';
import { Observable } from 'rxjs';

export abstract class Module {
  static moduleId = 0;
  static readonly isModule = true;
  static readonly moduleType = 'generic';

  public abstract name: string;
  public abstract description: string;

  id: string;

  props: Record<string, unknown> = {};
  propValues: Record<string, unknown> = {};
  out: Record<string, Writable<unknown> | Readable<unknown> | Observable<unknown>> = {};

  // protected component: unknown = undefined;
  protected app: SvelteComponent | undefined = undefined;

  abstract mount(): void;

  constructor() {
    this.id = `module-${String(Module.moduleId++).padStart(3, '0')}`;
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

  destroy(): void {
    this.app?.$destroy();
    this.app = undefined;
  }
}
