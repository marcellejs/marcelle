import { awaitPromises, map } from '@most/core';
import { Module } from '../../core/module';
import Component from './confusion.svelte';
import { BatchPrediction } from '../batch-prediction';
import { Stream } from '../../core/stream';

export type ConfusionMatrix = {
  name: string;
  data: {
    x: string;
    y: number;
  }[];
}[];

export class Confusion extends Module {
  name = 'confusion matrix';
  description = 'Confusion Matrix';

  #prediction: BatchPrediction;

  $confusion: Stream<ConfusionMatrix>;

  constructor(prediction: BatchPrediction) {
    super();
    this.#prediction = prediction;
    this.$confusion = new Stream(
      awaitPromises(
        map(async (predictionIds: string[]) => {
          const predictions = await Promise.all(
            predictionIds.map((id) => this.#prediction.predictionService.get(id)),
          );
          const labels = predictions.map((x) => x.label);
          const trueLabels = predictions.map((x) => x.trueLabel);
          const uniqueLabels = Array.from(new Set(labels.concat(trueLabels)));
          const labIndices: Record<string, number> = uniqueLabels.reduce(
            (x, l, i) => ({ ...x, [l]: i }),
            {},
          );
          const confusion = uniqueLabels.map((label1) => ({
            name: label1,
            data: uniqueLabels.map((label2) => ({ x: label2, y: 0 })),
          }));
          for (let i = 0; i < labels.length; i += 1) {
            confusion[labIndices[labels[i]]].data[labIndices[trueLabels[i]]].y += 1;
          }
          return confusion;
        }, this.#prediction.$predictions),
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
        title: this.name,
        confusion: this.$confusion,
      },
    });
  }
}
