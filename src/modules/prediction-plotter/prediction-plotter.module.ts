import { map } from '@most/core';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { Prediction } from '../../core/types';
import { plotter, Plotter } from '../plotter';
import { text, Text } from '../text';

export class PredictionPlotter extends Module {
  name = 'prediction plotter';
  description = 'Plot the confidences associated with a prediction';

  $confidenceStream: Stream<{ x: string; y: number }[]>;
  #plotConfidences: Plotter;
  #displayAccuracy: Text;

  constructor(predictionStream: Stream<Prediction>) {
    super();
    this.$confidenceStream = new Stream(
      map(
        ({ confidences }: Prediction) =>
          Object.entries(confidences).map(([label, value]) => ({ x: label, y: value })),
        predictionStream,
      ),
    );
    this.#plotConfidences = plotter({
      series: [{ name: 'Confidence', data: this.$confidenceStream }],
      options: {
        chart: { type: 'bar' },
        xaxis: { title: { text: 'Label' } },
        yaxis: { title: { text: 'Confidence' }, min: 0, max: 1 },
      },
    });
    this.#plotConfidences.name = '';
    this.#displayAccuracy = text({ text: 'Waiting for predictions...' });
    this.#displayAccuracy.name = this.name;
    this.#displayAccuracy.$text = new Stream(
      map(({ label, trueLabel }: Prediction) => {
        let t = `<h2>Predicted Label: <code>${label}</code></h2>`;
        if (trueLabel !== undefined) {
          t += `<p>True Label: ${trueLabel} (${label === trueLabel ? 'Correct' : 'Incorrect'})</p>`;
        }
        return t;
      }, predictionStream),
      true,
    );
    this.start();
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    // target.classList.add('flex', 'flex-row', 'flex-wrap', 'items-stretch');
    if (!target) return;
    const divLoss = document.createElement('div');
    divLoss.id = `${target.id}-${this.#displayAccuracy.id}`;
    // divLoss.classList.add('card', 'flex-none', 'xl:flex-1', 'w-full', 'xl:w-auto');
    const divAcc = document.createElement('div');
    divAcc.id = `${target.id}-${this.#plotConfidences.id}`;
    // divAcc.classList.add('card', 'flex-none', 'xl:flex-1', 'w-full', 'xl:w-auto');
    target.appendChild(divLoss);
    target.appendChild(divAcc);
    this.#displayAccuracy.mount(`#${divLoss.id}`);
    this.#plotConfidences.mount(`#${divAcc.id}`);
  }

  destroy(): void {
    this.#displayAccuracy.destroy();
    this.#plotConfidences.destroy();
  }
}
