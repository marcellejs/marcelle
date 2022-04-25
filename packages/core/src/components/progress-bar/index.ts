import type { Instance, Model } from '../../core';
import type { ProgressType } from './progress-bar.component';
import { ProgressBar } from './progress-bar.component';

export function progressBar(...args: ConstructorParameters<typeof ProgressBar>): ProgressBar {
  return new ProgressBar(...args);
}

export function trainingProgress(m: Model<Instance, unknown>): ProgressBar {
  if (!m.$training) {
    throw new Error('The argument is not a valid MLP');
  }
  const $stream = m.$training
    .map(({ status, epoch, epochs }): ProgressType => {
      let type: ProgressType['type'] = 'default';
      let progress: ProgressType['progress'] = epochs > 0 ? epoch / epochs : null;
      if (status === 'error') {
        type = 'danger';
      }
      if (status === 'idle') {
        type = 'idle';
        progress = 0;
      }
      if (['success', 'loaded'].includes(status)) {
        type = 'success';
        progress = 1;
      }
      if (['start', 'loading'].includes(status)) {
        progress = null;
      }
      return {
        message: `Status: ${status}`,
        progress,
        type,
      };
    })
    .hold();

  const p = new ProgressBar($stream);
  p.title = 'Training Progress';
  return p;
}

export type { ProgressBar };
