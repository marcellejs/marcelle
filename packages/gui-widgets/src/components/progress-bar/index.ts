import { BehaviorSubject, map } from 'rxjs';
import type { Instance, Model, BatchPrediction } from '@marcellejs/core';
import type { ProgressType } from './progress-bar.component';
import { ProgressBar } from './progress-bar.component';

export function progressBar(...args: ConstructorParameters<typeof ProgressBar>): ProgressBar {
  return new ProgressBar(...args);
}

export function trainingProgress(m: Model<Instance, unknown>): ProgressBar {
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

  const p = new ProgressBar($stream);
  p.title = 'Training Progress';
  return p;
}

export function predictionProgress(m: BatchPrediction): ProgressBar {
  if (!m.$status) {
    throw new Error('The argument is not a valid Batch Prediction');
  }
  const $stream = new BehaviorSubject<{
    message: string;
    progress: ProgressType['progress'];
    type: ProgressType['type'];
  }>({ message: `Status: idle`, progress: 0, type: 'idle' });
  m.$status
    .pipe(
      map(({ status, count, total }): ProgressType => {
        let type: ProgressType['type'] = 'default';
        let progress: ProgressType['progress'] = total > 0 ? (count + 1) / total : null;
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
    )
    .subscribe($stream);
  const p = progressBar($stream);
  p.title = 'Prediction Progress';
  return p;
}

export type { ProgressBar, ProgressType };
