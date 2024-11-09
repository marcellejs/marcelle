import type { ClassifierResults } from '../../core/model/types';
import { Component } from '../../core/component';
import { genericChart, type GenericChart } from '../generic-chart';
import { map, Observable } from 'rxjs';
import View from './confidence-plot.view.svelte';
import { mount, unmount } from 'svelte';

export class ConfidencePlot extends Component {
  title = 'confidence plot';

  #plotConfidences: GenericChart;

  constructor(public $predictionStream: Observable<ClassifierResults>) {
    super();
    this.#plotConfidences = genericChart({
      preset: 'bar-fast',
      options: {
        xlabel: 'Label',
        ylabel: 'Confidence',
        scales: { y: { suggestedMax: 1 } },
      },
    });
    this.#plotConfidences.addSeries(
      $predictionStream.pipe(
        map(({ confidences }: ClassifierResults) =>
          Object.entries(confidences)
            .map(([label, value]) => ({ x: label, y: value }))
            .sort((a, b) => {
              if (a.x < b.x) return -1;
              if (a.x > b.x) return 1;
              return 0;
            }),
        ),
      ),
      'Confidences',
    );
    this.#plotConfidences.title = '';
  }

  mount(target?: HTMLElement) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    const app = mount(View, {
      target: t,
      props: {
        predictionStream: this.$predictionStream,
        plotConfidences: this.#plotConfidences,
      },
    });
    return () => unmount(app);
  }
}
