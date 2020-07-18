import { Stream as MostStream } from '@most/types';
import { Stream } from './core/stream';
import './polyfill';
import './utils';

export function createStream<T>(s: MostStream<T>): Stream<T> {
  return new Stream(s);
}

export { createApp } from './core/application';
export { button } from './modules/button';
export { capture } from './modules/capture';
export { dataset } from './modules/dataset';
export { faker } from './modules/faker';
export { mobilenet } from './modules/mobilenet';
export { toggle } from './modules/toggle';
export { webcam } from './modules/webcam';

export { mlp } from './models/mlp';
