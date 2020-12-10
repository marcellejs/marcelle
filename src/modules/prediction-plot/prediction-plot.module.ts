import { map, startWith } from '@most/core';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { Prediction } from '../../core/types';
import { chart, Chart } from '../chart';
import { text, Text } from '../text';

export class PredictionPlot extends Module {
  name = 'prediction plot';

  $confidenceStream: Stream<{ x: string; y: number }[]>;
  #plotConfidences: Chart;
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
    this.#plotConfidences = chart({
      preset: 'bar-fast',
      options: {
        aspectRatio: 3,
        xlabel: 'Label',
        ylabel: 'Confidence',
        scales: { y: { suggestedMax: 1 } },
      },
    });
    this.#plotConfidences.addSeries(
      this.$confidenceStream as Stream<number[] | Array<{ x: unknown; y: unknown }>>,
      'Confidences',
    );
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
    this.#displayLabel.name = this.name;
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
