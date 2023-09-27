import type { ProgressBar } from '../progress-bar';
import type { ProgressType } from '../progress-bar/progress-bar.component';
import { progressBar } from '../progress-bar';
import { BatchPrediction } from './batch-prediction.component';
import { BehaviorSubject, map } from 'rxjs';

export function batchPrediction(
  ...args: ConstructorParameters<typeof BatchPrediction>
): BatchPrediction {
  return new BatchPrediction(...args);
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

export type { BatchPrediction };
