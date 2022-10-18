import type { ProgressBar } from '../progress-bar';
import type { ProgressType } from '../progress-bar/progress-bar.component';
import { progressBar } from '../progress-bar';
import { BatchPrediction } from './batch-prediction.component';

export function batchPrediction(
  ...args: ConstructorParameters<typeof BatchPrediction>
): BatchPrediction {
  return new BatchPrediction(...args);
}

export function predictionProgress(m: BatchPrediction): ProgressBar {
  if (!m.$status) {
    throw new Error('The argument is not a valid Batch Prediction');
  }
  const $stream = m.$status
    .map(({ status, count, total }): ProgressType => {
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
    })
    .hold();
  const p = progressBar($stream);
  p.title = 'Prediction Progress';
  return p;
}

export type { BatchPrediction };
