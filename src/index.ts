import { Stream as MostStream } from '@most/types';
import { Stream } from './core/stream';
import './utils';

export { Stream };
export function createStream<T>(s: MostStream<T>): Stream<T> {
  return new Stream(s);
}

export { createApp } from './core/application';
export { createWizard } from './core/wizard';

export { button } from './modules/button';
export { capture } from './modules/capture';
export * from './modules/dataset';
export { faker } from './modules/faker';
export { mobilenet } from './modules/mobilenet';
export { parameters } from './modules/parameters';
export { progress } from './modules/progress';
export { text } from './modules/text';
export { toggle } from './modules/toggle';
export { webcam } from './modules/webcam';

export * from './models/mlp';
