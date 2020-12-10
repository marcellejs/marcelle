import { awaitPromises, map } from '@most/core';
import { dequal } from 'dequal';
import { Module } from '../../core/module';
import Component from './confusion.svelte';
import { BatchPrediction } from '../batch-prediction';
import { Stream } from '../../core/stream';
import { Prediction } from '../../core/types';

export type ConfusionMatrix = Array<{
  x: string;
  y: string;
  v: number;
}>;

export class Confusion extends Module {
  title = 'confusion matrix';

  #prediction: BatchPrediction;

  $confusion: Stream<ConfusionMatrix>;
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
          this.#prediction.$predictions,
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
      map(
        (predictions: Prediction[]) =>
          predictions.reduce(
            (correct, { label, trueLabel }) => correct + (label === trueLabel ? 1 : 0),
            0,
          ) / predictions.length,
        predStream,
      ),
      true,
    );

    this.start();
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    this.destroy();
    this.$$.app = new Component({
      target,
      props: {
        title: this.title,
        confusion: this.$confusion,
        accuracy: this.$accuracy,
        labels: this.$labels,
      },
    });
  }
}
