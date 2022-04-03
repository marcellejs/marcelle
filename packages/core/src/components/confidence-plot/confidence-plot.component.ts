import type { ClassifierPrediction } from '../../core/types';
import { map, startWith } from '@most/core';
import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import { genericChart, GenericChart } from '../generic-chart';
import { text, Text } from '../text';

export class ConfidencePlot extends Component {
  title = 'confidence plot';

  $confidenceStream: Stream<{ x: string; y: number }[]>;
  #plotConfidences: GenericChart;
  #displayLabel: Text;

  constructor(predictionStream: Stream<ClassifierPrediction>) {
    super();
    this.$confidenceStream = new Stream(
      map(
        ({ confidences }: ClassifierPrediction) =>
          Object.entries(confidences).map(([label, value]) => ({ x: label, y: value })),
        predictionStream,
      ),
    );
    this.#plotConfidences = genericChart({
      preset: 'bar-fast',
      options: {
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
    this.#displayLabel = text('Waiting for predictions...');
    this.#displayLabel.title = this.title;
    this.#displayLabel.$value = new Stream(
      startWith('Waiting for predictions...')(
        map(({ label, trueLabel }: ClassifierPrediction) => {
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
