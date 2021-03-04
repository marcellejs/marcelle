import { map, startWith } from '@most/core';
import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { Prediction } from '../../core/types';
import { chart, Chart } from '../chart';
import { text, Text } from '../text';

export class ClassificationPlot extends Module {
  title = 'classification plot';

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
      this.$confidenceStream as Stream<number[]> | Stream<Array<{ x: unknown; y: unknown }>>,
      'Confidences',
    );
    this.#plotConfidences.title = '';
    this.#displayLabel = text({ text: 'Waiting for predictions...' });
    this.#displayLabel.title = this.title;
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

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const divLab = document.createElement('div');
    divLab.id = `${t.id}-${this.#displayLabel.id}`;
    const divConf = document.createElement('div');
    divConf.id = `${t.id}-${this.#plotConfidences.id}`;
    t.appendChild(divLab);
    t.appendChild(divConf);
    this.#displayLabel.title = this.title;
    this.#displayLabel.mount(divLab);
    this.#plotConfidences.mount(divConf);
    this.destroy = () => {
      divLab.parentElement.removeChild(divLab);
      divConf.parentElement.removeChild(divConf);
      this.#displayLabel.destroy();
      this.#plotConfidences.destroy();
    };
  }

  destroy(): void {
    this.#displayLabel.destroy();
    this.#plotConfidences.destroy();
  }
}
