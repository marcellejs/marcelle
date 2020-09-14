import { map, startWith } from '@most/core';
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
  #displayLabel: Text;

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
    this.#displayLabel = text({ text: 'Waiting for predictions...' });
    this.#displayLabel.name = this.name;
    this.#displayLabel.$text = new Stream(
      startWith('Waiting for predictions...')(
        map(({ label, trueLabel }: Prediction) => {
          let t = `<h2>Predicted Label: <code>${label}</code></h2>`;
          if (trueLabel !== undefined) {
            t += `<p>True Label: ${trueLabel} (${
              label === trueLabel ? 'Correct' : 'Incorrect'
            })</p>`;
          }
          return t;
        }, predictionStream),
      ),
      true,
    );
    this.start();
  }

  mount(targetSelector?: string): void {
    const target = document.querySelector(targetSelector || `#${this.id}`);
    if (!target) return;
    const divLab = document.createElement('div');
    divLab.id = `${target.id}-${this.#displayLabel.id}`;
    const divConf = document.createElement('div');
    divConf.id = `${target.id}-${this.#plotConfidences.id}`;
    target.appendChild(divLab);
    target.appendChild(divConf);
    this.#displayLabel.mount(`#${divLab.id}`);
    this.#plotConfidences.mount(`#${divConf.id}`);
    this.destroy = () => {
      target.removeChild(divLab);
      target.removeChild(divConf);
      this.#displayLabel.destroy();
      this.#plotConfidences.destroy();
    };
  }

  destroy(): void {
    this.#displayLabel.destroy();
    this.#plotConfidences.destroy();
  }
}
