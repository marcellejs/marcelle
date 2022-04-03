import { Component, Stream } from '@marcellejs/core';
import { UMAP } from 'umap-js';
import View from './umap.view.svelte';

export class Umap extends Component {
  constructor(dataset, supervised = false) {
    super();
    this.$embedding = new Stream([], true);
    this.$labels = new Stream([], true);
    this.title = 'umap';
    this.supervised = supervised;
    this.dataset = dataset;
    this.start();
  }

  async render() {
    const instances = await this.dataset.items().select(['x', 'y']).toArray();
    const umapData = instances.reduce((d, { x }) => d.concat([x[0]]), []);
    const labels = instances.map((x) => x.y);
    this.$labels.set(labels);
    const umap = new UMAP({ nComponents: 2 });
    if (this.supervised) {
      umap.setSupervisedProjection(labels);
    }
    const embedding = await umap.fitAsync(umapData, () => {
      this.$embedding.set(umap.getEmbedding());
    });
    this.$embedding.set(embedding);
  }

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = new View({
      target: t,
      props: {
        title: this.title,
        embedding: this.$embedding,
        labels: this.$labels,
      },
    });
  }
}
