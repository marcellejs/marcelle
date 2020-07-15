import { SvelteComponent } from 'svelte';
import { Stream, isStream } from './stream';

let nextId = 0;

interface ModuleInternals {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  streams: Array<Stream<any>>;
  app: SvelteComponent | undefined;
  readonly isModule: boolean;
  readonly moduleType: string;
  [key: string]: unknown;
}

export abstract class Module {
  public abstract name: string;
  public abstract description: string;

  id = `module-${String(nextId++).padStart(3, '0')}`;

  protected $$: ModuleInternals = {
    streams: [],
    app: undefined,
    isModule: true,
    moduleType: 'generic',
  };

  abstract mount(targetId?: string): void;

  destroy(): void {
    this.$$.app?.$destroy();
    this.$$.app = undefined;
  }

  start(): void {
    this.$$.streams = Object.entries(this)
      .filter(([x, s]) => x[0] === '$' && isStream(s))
      .map(([, stream]) => {
        stream.start();
        return stream;
      });
  }

  stop(): void {
    this.$$.streams.forEach((s) => {
      s.stop();
    });
  }

  dispose(): void {
    this.destroy();
    this.stop();
  }
}
