import { DNN, DNNOptions } from './dnn.module';

export function dnn(options?: DNNOptions): DNN {
  return new DNN(options);
}

export type { DNN, DNNOptions };
