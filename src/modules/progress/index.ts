import { Progress } from './progress.module';
import { Model } from '../../core';

export function progress<T, U>(m: Model<T, U>): Progress<T, U> {
  if (!m.$training) {
    throw new Error('The argument is not a valid MLP');
  }
  return new Progress(m);
}
