import type { ClassifierResults } from '../../core/model/types';
import { Component } from '../../core/component';
import { Stream } from '../../core/stream';
import { genericChart, GenericChart } from '../generic-chart';
import { text, Text } from '../text';

export class ConfidencePlot extends Component {
  title = 'confidence plot';

  $confidenceStream: Stream<{ x: string; y: number }[]>;
  #plotConfidences: GenericChart;
  #displayLabel: Text;

  constructor(predictionStream: Stream<ClassifierResults>) {
    super();
    this.$confidenceStream = predictionStream.map(({ confidences }: ClassifierResults) =>
      Object.entries(confidences)
        .map(([label, value]) => ({ x: label, y: value }))
        .sort((a, b) => {
          if (a.x < b.x) return -1;
          if (a.x > b.x) return 1;
          return 0;
        }),
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
      predictionStream
        .map(
          ({ label }: ClassifierResults) =>
            `<p>Predicted Label: <code style="font-size: 1.5rem;">${label}</code></p>`,
        )
        .startWith('Waiting for predictions...'),
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
