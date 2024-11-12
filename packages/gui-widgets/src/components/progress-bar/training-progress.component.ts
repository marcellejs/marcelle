import type { Instance, Model } from '@marcellejs/core';
import { ProgressBar, type ProgressType } from './progress-bar.component';
import { map } from 'rxjs';

export class TrainingProgress extends ProgressBar {
  constructor(m: Model<Instance, unknown>) {
    if (!m.$training) {
      throw new Error('The argument is not a valid MLP');
    }
    const $stream = m.$training.pipe(
      map(({ status, epoch, epochs }): ProgressType => {
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
      }),
    );
    super($stream);
    this.title = 'Training Progress';
  }
}
