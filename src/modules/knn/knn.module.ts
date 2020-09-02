import { tensor2d } from '@tensorflow/tfjs-core';
import { KNNClassifier } from '@tensorflow-models/knn-classifier';
import { Dataset } from '../dataset/dataset.module';
import { Stream } from '../../core/stream';
import { Module } from '../../core/module';
import { Parametrable, TrainingStatus } from '../../core/types';

type StreamParams = Parametrable['parameters'];
export interface KNNParameters extends StreamParams {
  k: Stream<number>;
}

export interface KNNOptions {
  k: number;
}

export interface KNNResults {
  label: string;
  confidences: { [key: string]: number };
}

export class KNN extends Module implements Parametrable {
  name = 'KNN';
  description = 'K-Nearest Neighbours';

  parameters: KNNParameters;
  labels: string[];
  $classifier = new KNNClassifier();
  $training = new Stream<TrainingStatus>({ status: 'idle' });

  constructor({ k = 3 }: Partial<KNNOptions> = {}) {
    super();
    this.parameters = {
      k: new Stream(k, true),
    };
  }

  async activateClass(dataset: Dataset, label: string): Promise<void> {
    const allInstances = await Promise.all(
      dataset.$instances.value.map((id) =>
        dataset.instanceService.get(id, { query: { $select: ['id', 'features'] } }),
      ),
    );
    dataset.$classes.value[label].forEach((id) => {
      const { features } = allInstances.find((x) => x.id === id) as { features: number[][] };
      this.$classifier.addExample(tensor2d(features), label);
    });
  }

  train(dataset: Dataset): void {
    this.labels = dataset.$labels.value;
    // this.parameters.epochs.set(dataset.$labels.value.length);
    if (this.labels.length < 1) {
      this.$training.set({ status: 'error' });
      throw new Error('Cannot train a kNN with no classes');
    }
    this.$training.set({ status: 'start', epochs: this.labels.length });
    setTimeout(async () => {
      this.$classifier.clearAllClasses();
      this.labels.forEach((label, i) => {
        this.activateClass(dataset, label);
        this.$training.set({
          status: 'epoch',
          epoch: i,
          epochs: this.labels.length,
          data: {
            accuracy: 0,
            loss: 0,
            accuracyVal: 0,
            lossVal: 0,
          },
        });
      });
      this.$training.set({ status: 'success' });
    }, 100);
  }

  clear(): void {
    delete this.$classifier;
  }

  async predict(x: number[][]): Promise<KNNResults> {
    const pred = await this.$classifier.predictClass(tensor2d(x), this.parameters.k.value);
    const { label, confidences } = pred;
    return { label, confidences };
  }

  // eslint-disable-next-line class-methods-use-this
  mount(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }
}
