import { type Dataset, type Instance, isDataset, Model } from '../../core';
import { BehaviorSubject } from 'rxjs';
import type { LazyIterable } from '../../utils';
import { UMAP } from 'umap-js';

export interface UmapOptions {
  nComponents: number;
  nNeighbors: number;
  minDist: number;
  spread: number;
  supervised: boolean;
}

export interface UmapInstance extends Instance {
  x: number[];
  y: number;
}

/**
 * A Multi-layer Perceptron for regression with two hidden layers
 */
export class Umap extends Model<UmapInstance, number[]> {
  title = 'UMAP';
  serviceName = 'umap';

  parameters: {
    nComponents: BehaviorSubject<number>;
    nNeighbors: BehaviorSubject<number>;
    minDist: BehaviorSubject<number>;
    spread: BehaviorSubject<number>;
    supervised: BehaviorSubject<boolean>;
  };

  model: UMAP;

  constructor({
    nComponents = 2,
    nNeighbors = 15,
    minDist = 0.1,
    spread = 1,
    supervised = false,
  }: Partial<UmapOptions> = {}) {
    super();
    this.parameters = {
      nComponents: new BehaviorSubject(nComponents),
      nNeighbors: new BehaviorSubject(nNeighbors),
      minDist: new BehaviorSubject(minDist),
      spread: new BehaviorSubject(spread),
      supervised: new BehaviorSubject(supervised),
    };
  }

  async train(dataset: Dataset<UmapInstance> | LazyIterable<UmapInstance>): Promise<void> {
    this.$training.next({ status: 'start', epochs: -1 });

    const items = isDataset(dataset) ? dataset.items() : dataset;
    const instances = await items.toArray();
    const umapData = instances.reduce((d, { x }) => d.concat([x]), []);

    this.model = new UMAP({ nComponents: this.parameters.nComponents.getValue() });

    if (this.parameters.supervised.getValue()) {
      const labels = instances.map((x) => x.y);
      this.model.setSupervisedProjection(labels);
    }

    const nEpochs = this.model.initializeFit(umapData);
    this.$training.next({ status: 'start', epochs: nEpochs });

    for (let i = 0; i < nEpochs; i++) {
      this.model.step();
      this.$training.next({
        status: 'epoch',
        epoch: i + 1,
        epochs: nEpochs,
        data: { embedding: this.model.getEmbedding() },
      });
    }

    this.$training.next({
      status: 'success',
      data: { embedding: this.model.getEmbedding() },
    });
  }

  async predict(x: number[]): Promise<number[]> {
    if (!this.model) return null;
    return this.model.transform([x])[0];
  }

  // eslint-disable-next-line class-methods-use-this
  save(): never {
    throw new Error('Umap does not support saving');
  }

  // eslint-disable-next-line class-methods-use-this
  load(): never {
    throw new Error('Umap does not support loading');
  }

  // eslint-disable-next-line class-methods-use-this
  download(): never {
    throw new Error('Umap does not support downloading');
  }

  // eslint-disable-next-line class-methods-use-this
  upload(): never {
    throw new Error('Umap does not support uploading');
  }
}
