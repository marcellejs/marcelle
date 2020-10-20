import { Backend, BackendOptions } from './backend';

export function createBackend({ location = 'memory', auth = false }: BackendOptions = {}): Backend {
  return new Backend({ location, auth });
}

export type { Backend };
