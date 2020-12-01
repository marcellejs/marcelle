import { DataStore } from '../data-store/data-store';
import { Dataset } from '../modules/dataset';
import { Module } from './module';
import { Stream } from './stream';
import { Parametrable, TrainingStatus } from './types';

type StreamParams = Parametrable['parameters'];

export abstract class Model<InputType, ResultType> extends Module implements Parametrable {
  abstract parameters: StreamParams;
  $training = new Stream<TrainingStatus>({ status: 'idle' }, true);

  constructor(protected dataStore: DataStore = new DataStore()) {
    super();
  }

  abstract train(dataset: Dataset): void;
  abstract predict(x: InputType): Promise<ResultType>;

  // eslint-disable-next-line class-methods-use-this
  mount(): void {}
}
