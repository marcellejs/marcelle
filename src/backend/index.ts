import { Backend, BackendOptions } from './backend';

export function createBackend({ location = 'memory' }: BackendOptions = {}): Backend {
  return new Backend({ location });
}

export type { Backend };
