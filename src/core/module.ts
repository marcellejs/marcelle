import { isStream } from './stream';
import { ModuleInternals } from './types';

let nextId = 0;

export abstract class Module {
  public abstract name: string;
  public abstract description: string;
  readonly isModule = true;

  id = `module-${String(nextId++).padStart(3, '0')}`;

  $$: ModuleInternals = {
    streams: [],
    app: undefined,
    moduleType: 'generic',
  };

  abstract mount(targetSelector?: string): void;

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
