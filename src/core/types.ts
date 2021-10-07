import type { SvelteComponent } from 'svelte';
import type { Stream } from './stream';

export interface ComponentInternals {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  streams: Array<Stream<any>>;
  app?: SvelteComponent;
  [key: string]: unknown;
}

export interface Parametrable {
  parameters: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [name: string]: Stream<any>;
  };
}

export type ObjectId = string;

export interface Instance<InputType, OutputType> {
  id?: ObjectId;
  x: InputType;
  y: OutputType;
  thumbnail?: string;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
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
  checkpoints?: Array<ModelCheckpoint>;
  model?: {
    summary?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface Prediction {
  id?: ObjectId;
  instanceId: ObjectId;
  label?: string;
  trueLabel?: string;
  confidences?: Record<string, number>;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}
