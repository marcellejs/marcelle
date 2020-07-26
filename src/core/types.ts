import type { SvelteComponent } from 'svelte';
import type { Stream } from './stream';

export interface ModuleInternals {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  streams: Array<Stream<any>>;
  app?: SvelteComponent;
  readonly moduleType: string;
  [key: string]: unknown;
}

export interface Parametrable {
  parameters: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: Stream<any>;
  };
}

export type InstanceId = string;

export interface Instance {
  id?: InstanceId;
  label: string;
  data: unknown;
  thumbnail?: string;
  features?: number[][];
  type?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface TrainingStatus {
  status: 'idle' | 'start' | 'epoch' | 'success' | 'error';
  epoch?: number;
  data?: Record<string, unknown>;
}
