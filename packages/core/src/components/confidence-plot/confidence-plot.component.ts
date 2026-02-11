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

  #divLab?: HTMLElement;
  #divConf?: HTMLElement;

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
    if (!t) {
      console.warn(`ConfidencePlot: Failed to mount because the target element was not found.`);
      return;
    }


    // Dynamically create and append elements for display
    this.#divLab = document.createElement('div');
    this.#divLab.id = `${t.id}-${this.#displayLabel.id}`;
    this.#divConf = document.createElement('div');
    this.#divConf.id = `${t.id}-${this.#plotConfidences.id}`;
    t.appendChild(this.#divLab);
    t.appendChild(this.#divConf);

    // Mount subcomponents
    this.#displayLabel.title = this.title;
    this.#displayLabel.mount(this.#divLab);
    this.#plotConfidences.mount(this.#divConf);
  }

  destroy(): void {
    // Cleanup dynamically created DOM elements
    this.#divLab?.parentElement?.removeChild(this.#divLab);
    this.#divConf?.parentElement?.removeChild(this.#divConf);

    // Destroy subcomponents
    this.#displayLabel.destroy();
    this.#plotConfidences.destroy();
  }
}
