import { Component } from '@marcellejs/core';
import { BehaviorSubject } from 'rxjs';
import { UMAP } from 'umap-js';
import View from './umap.view.svelte';
import { mount } from "svelte";

export class Umap extends Component {
  constructor(dataset, supervised = false) {
    super();
    this.$embedding = new BehaviorSubject([]);
    this.$labels = new BehaviorSubject([]);
    this.title = 'umap';
    this.supervised = supervised;
    this.dataset = dataset;
  }

  async render() {
    const instances = await this.dataset.items().select(['x', 'y']).toArray();
    const umapData = instances.reduce((d, { x }) => d.concat([x]), []);
    const labels = instances.map((x) => x.y);
    this.$labels.next(labels);
    const umap = new UMAP({ nComponents: 2 });
    if (this.supervised) {
      umap.setSupervisedProjection(labels);
    }
    const embedding = await umap.fitAsync(umapData, () => {
      this.$embedding.next(umap.getEmbedding());
    });
    this.$embedding.next(embedding);
  }

  mount(target) {
    const t = target || document.querySelector(`#${this.id}`);
    if (!t) return;
    this.destroy();
    this.$$.app = mount(View, {
          target: t,
          props: {
            title: this.title,
            embedding: this.$embedding,
            labels: this.$labels,
          },
        });
  }
}
