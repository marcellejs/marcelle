import type { Dataset } from '../../modules/dataset';
import type { Parametrable, TrainingStatus } from '../types';
import { Module } from '../module';
import { Stream } from '../stream';

type StreamParams = Parametrable['parameters'];

export abstract class Model extends Module implements Parametrable {
  abstract parameters: StreamParams;
  $training = new Stream<TrainingStatus>({ status: 'idle' }, true);

  abstract train(dataset: Dataset): void;
  abstract predict(x: unknown): Promise<unknown>;

  // eslint-disable-next-line class-methods-use-this
  mount(): void {}
}

export type ModelConstructor<T extends Model> = new (...args: any[]) => T;