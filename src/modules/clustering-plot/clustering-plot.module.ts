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

  constructor(dataset: Dataset) {
    super();

    this.dataset = dataset;
    this.$clusters = new Stream([]);
    this.$embedding = new Stream([]);

    // get data from dataset
    dataset.$changes.subscribe(async () => {
      const allInstances = await this.dataset.getAllInstances(['features']);
      if (allInstances.length > 0) {
        this.$embedding.set(allInstances.map((c) => [c.features[0][0], c.features[0][1]]));
        this.$clusters.set(new Array(this.$embedding.value.length).fill(0));
      } else {
        console.log('empty dataset');
        // this.$embedding.set([]);
        this.$clusters.set([]);
      }
    });
    this.start();
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
