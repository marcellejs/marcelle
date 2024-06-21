import type { SvelteComponent } from 'svelte';
import type { FeathersService } from '@feathersjs/feathers';
import type { Stream } from './stream';
import type { ServiceIterable } from './data-store/service-iterable';

export interface ComponentInternals {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  streams: Array<Stream<any>>;
  app?: SvelteComponent;
  [key: string]: unknown;
}

export interface Parametrable {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parameters: Record<string, Stream<any>>;
}

export type ObjectId = string;

export type Service<T> = FeathersService<T> & { items: () => ServiceIterable<T> };

export interface User {
  email: string;
  role: string;
}

export interface Instance {
  id?: ObjectId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  x: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y: any;
  thumbnail?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface TrainingStatus {
  status: 'idle' | 'start' | 'epoch' | 'success' | 'error' | 'loaded' | 'loading';
  epoch?: number;
  epochs?: number;
  data?: Record<string, unknown>;
}

export interface StoredModel {
  id?: ObjectId;
  name: string;
  files: Array<[string, string]>;
  format: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ModelCheckpoint {
  id: ObjectId;
  name: string;
  service: string;
  metadata?: Record<string, unknown>;
}

export interface TrainingRun {
  id?: ObjectId;
  name: string;
  basename: string;
  start: string;
  status: TrainingStatus['status'];
  epoch?: number;
  epochs?: number;
  params?: Record<string, unknown>;
  logs?: TrainingStatus['data'];
  checkpoints?: ModelCheckpoint[];
  model?: {
    summary?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface Prediction {
  id?: ObjectId;
  instanceId: ObjectId;
  yTrue?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export interface ClassifierPrediction extends Prediction {
  label?: string;
  confidences?: Record<string, number>;
}
