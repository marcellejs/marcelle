import type { BatchPrediction } from '../batch-prediction';
import { dequal } from 'dequal';
import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import type { ClassifierPrediction } from '../../core/types';
import View from './confusion-matrix.view.svelte';
import { iterableFromService } from '../../core/data-store/service-iterable';

export type ConfusionMatrixT = Array<{
  x: string;
  y: string;
  v: number;
}>;

export class ConfusionMatrix extends Component {
  title = 'confusion matrix';

  #prediction: BatchPrediction;

  $confusion = new Stream<ConfusionMatrixT>([], true);
  $accuracy = new Stream<number>(undefined, true);
  $labels = new Stream<string[]>([], true);
  $selected = new Stream<{ x: string; y: string; v: number }>(null, true);
  $progress = new Stream<number | false>(false, true);

  constructor(prediction: BatchPrediction) {
    super();
    this.#prediction = prediction;
    this.start();
    this.setup();
  }

  setup(): void {
    let predictions: ClassifierPrediction[] = [];
    this.#prediction.$status.subscribe(async ({ status, count, total, data }) => {
      if (status === 'start') {
        predictions = [];
        this.$progress.set(null);
      } else if (status === 'running') {
        predictions.push(data as ClassifierPrediction);
        this.$progress.set(count / total);
      } else if (status === 'loaded') {
        predictions = (await iterableFromService(this.#prediction.predictionService)
          .query({
            $select: ['id', 'label', 'yTrue'],
          })
          .toArray()) as ClassifierPrediction[];
        this.$progress.set(false);
      } else if (status === 'loading') {
        predictions = [];
        this.$progress.set(null);
      } else {
        this.$progress.set(false);
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
      this.$labels.set(uniqueLabels);
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
    this.$confusion.set(conf);
  }

  updateAccuracy(predictions: ClassifierPrediction[]): void {
    if (predictions.length === 0) {
      this.$accuracy.set(undefined);
    } else {
      this.$accuracy.set(
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
        loading: this.#prediction.$status.map(({ status }) => status === 'loading'),
        progress: this.$progress,
        confusion: this.$confusion,
        accuracy: this.$accuracy,
        labels: this.$labels,
        selected: this.$selected,
      },
    });
  }
}
