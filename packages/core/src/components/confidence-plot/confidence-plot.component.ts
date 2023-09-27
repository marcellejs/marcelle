import type { ClassifierResults } from '../../core/model/types';
import { Component } from '../../core/component';
import { genericChart, GenericChart } from '../generic-chart';
import { text, Text } from '../text';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { ChartPoint } from '../generic-chart/generic-chart.component';

export class ConfidencePlot extends Component {
  title = 'confidence plot';

  $confidenceStream: Observable<{ x: string; y: number }[]>;
  #plotConfidences: GenericChart;
  #displayLabel: Text;

  constructor(predictionStream: Observable<ClassifierResults>) {
    super();
    this.$confidenceStream = predictionStream.pipe(
      map(({ confidences }: ClassifierResults) =>
        Object.entries(confidences)
          .map(([label, value]) => ({ x: label, y: value }))
          .sort((a, b) => {
            if (a.x < b.x) return -1;
            if (a.x > b.x) return 1;
            return 0;
          }),
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
      this.$confidenceStream as BehaviorSubject<ChartPoint[]>,
      'Confidences',
    );
    this.#plotConfidences.title = '';
    this.#displayLabel = text('Waiting for predictions...');
    this.#displayLabel.title = this.title;
    this.#displayLabel.$value.next('Waiting for predictions...');
    predictionStream
      .pipe(
        map(
          ({ label }: ClassifierResults) =>
            `<p>Predicted Label: <code style="font-size: 1.5rem;">${label}</code></p>`,
        ),
      )
      .subscribe(this.#displayLabel.$value);
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
