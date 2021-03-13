import { Module } from '../../core/module';
import { Stream } from '../../core/stream';
import { Dataset } from '../dataset';
import { KMeans } from '../kmeans';
import Component from './clustering.svelte';

export class ClusteringPlot extends Module {
  title = 'Clustering plot';

  dataset: Dataset;
  $clusters: Stream<number[]>;
  $embedding: Stream<number[][]>;
  dimReduction: string;

  constructor(dataset: Dataset, reduction: string = 'features12') {
    super();

    this.dataset = dataset;
    this.$clusters = new Stream([]);
    this.$embedding = new Stream([]);
    this.dimReduction = reduction;

    // get data from dataset
    dataset.$changes.subscribe(async () => {
      const data = await this.reduceDatasetDim();
      if (data.length > 0) {
        this.$embedding.set(data);
        this.$clusters.set(new Array(this.$embedding.value.length).fill(0));
      } else {
        this.$embedding.set([]);
        this.$clusters.set([]);
      }
    });
    this.start();
  }

  async reduceDatasetDim(): Promise<number[][]> {
    let data: number[][] = [];
    if (this.dimReduction === 'features12') {
      const allInstances = await this.dataset.getAllInstances(['features']);
      data = allInstances.map((c) => [c.features[0][0], c.features[0][1]]);
    }
    // else if (this.dimReduction === 'raw') {
    // }
    return data;
  }

  async render(method: KMeans) {
    this.$clusters.set(method.$clusters.value);
  }

  mount(target?: HTMLElement): void {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new Component({
      target: t,
      props: {
        title: this.title,
        embedding: this.$embedding,
        labels: this.$clusters,
      },
    });
  }
}
