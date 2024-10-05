import type { BatchPrediction } from '../batch-prediction';
import { dequal } from 'dequal';
import { Component } from '../../core/component';
import type { ClassifierPrediction } from '../../core/types';
import View from './confusion-matrix.view.svelte';
import { BehaviorSubject, map } from 'rxjs';

export type ConfusionMatrixT = Array<{
  x: string;
  y: string;
  v: number;
}>;

export class ConfusionMatrix extends Component {
  title = 'confusion matrix';

  #prediction: BatchPrediction;

  $confusion = new BehaviorSubject<ConfusionMatrixT>([]);
  $accuracy = new BehaviorSubject<number>(undefined);
  $labels = new BehaviorSubject<string[]>([]);
  $selected = new BehaviorSubject<{ x: string; y: string; v: number }>(null);
  $progress = new BehaviorSubject<number | false>(false);

  constructor(prediction: BatchPrediction) {
    super();
    this.#prediction = prediction;
    this.setup();
  }

  setup(): void {
    let predictions: ClassifierPrediction[] = [];
    this.#prediction.$status.subscribe(async ({ status, count, total, data }) => {
      if (status === 'start') {
        predictions = [];
        this.$progress.next(null);
      } else if (status === 'running') {
        predictions.push(data as ClassifierPrediction);
        this.$progress.next(count / total);
      } else if (status === 'loaded') {
        predictions = await this.#prediction.predictionService
          .items()
          .query({
            $select: ['id', 'label', 'yTrue'],
          })
          .toArray();
        this.$progress.next(false);
      } else if (status === 'loading') {
        predictions = [];
        this.$progress.next(null);
      } else {
        this.$progress.next(false);
      }
      this.updateConfusionMatrix(predictions);
      this.updateAccuracy(predictions);
    });
  }

  updateConfusionMatrix(predictions: ClassifierPrediction[]): void {
    const labels = predictions.map((x) => x.label);
    const trueLabels = predictions.map((x) => x.yTrue);
    const uniqueLabels = Array.from(new Set(labels.concat(trueLabels)));
    if (!dequal(uniqueLabels, this.$labels.value)) {
      this.$labels.next(uniqueLabels);
    }
    const nLabels = uniqueLabels.length;
    const labIndices: Record<string, number> = uniqueLabels.reduce(
      (x, l, i) => ({ ...x, [l]: i }),
      {},
    );
    const confusion = Array.from(Array(nLabels ** 2), () => 0);
    for (let i = 0; i < labels.length; i += 1) {
      confusion[labIndices[labels[i]] * nLabels + labIndices[trueLabels[i]]] += 1;
    }
    const conf = confusion.map((v, i) => ({
      x: uniqueLabels[Math.floor(i / nLabels)],
      y: uniqueLabels[i % nLabels],
      v,
    }));
    this.$confusion.next(conf);
  }

  updateAccuracy(predictions: ClassifierPrediction[]): void {
    if (predictions.length === 0) {
      this.$accuracy.next(undefined);
    } else {
      this.$accuracy.next(
        predictions.reduce((correct, { label, yTrue }) => correct + (label === yTrue ? 1 : 0), 0) /
          predictions.length,
      );
    }
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        loading: this.#prediction.$status.pipe(map(({ status }) => status === 'loading')),
        progress: this.$progress,
        confusion: this.$confusion,
        accuracy: this.$accuracy,
        labels: this.$labels,
        selected: this.$selected,
      },
    });
  }
}
