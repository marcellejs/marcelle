import { Progress } from './progress.module';
import { MLP } from '../mlp';

export function progress(m: MLP): Progress {
  if (!m.$training) {
    throw new Error('The argument is not a valid MLP');
  }
  return new Progress(m);
}
