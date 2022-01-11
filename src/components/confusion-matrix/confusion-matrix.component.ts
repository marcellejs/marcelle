import { awaitPromises, debounce, map } from '@most/core';
import { dequal } from 'dequal';
import { Component } from '../../core/component';
import { BatchPrediction } from '../batch-prediction';
import { Stream } from '../../core/stream';
import type { Prediction } from '../../core/types';
import View from './confusion-matrix.view.svelte';

export type ConfusionMatrixT = Array<{
  x: string;
  y: string;
  v: number;
}>;

export class ConfusionMatrix extends Component {
  title = 'confusion matrix';

  #prediction: BatchPrediction;

  $confusion: Stream<ConfusionMatrixT>;
  $accuracy: Stream<number>;
  $labels: Stream<string[]> = new Stream([], true);

  constructor(prediction: BatchPrediction) {
    super();
    this.#prediction = prediction;
    const predStream = new Stream(
      awaitPromises(
        map(
          async (predictionIds: string[]) =>
            Promise.all(predictionIds.map((id) => this.#prediction.predictionService.get(id))),
          debounce(500, this.#prediction.$predictions),
        ),
      ),
    );
    this.$confusion = new Stream(
      map((predictions: Prediction[]) => {
        const labels = predictions.map((x) => x.label);
        const trueLabels = predictions.map((x) => x.trueLabel);
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
        return confusion.map((v, i) => ({
          x: uniqueLabels[Math.floor(i / nLabels)],
          y: uniqueLabels[i % nLabels],
          v,
        }));
      }, predStream),
      true,
    );

    this.$accuracy = new Stream(
      map((predictions: Prediction[]) => {
        if (predictions.length === 0) return undefined;
        return (
          predictions.reduce(
            (correct, { label, trueLabel }) => correct + (label === trueLabel ? 1 : 0),
            0,
          ) / predictions.length
        );
      }, predStream),
      true,
    );

    this.start();
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        confusion: this.$confusion,
        accuracy: this.$accuracy,
        labels: this.$labels,
      },
    });
  }
}
