import { tensor2d } from '@tensorflow/tfjs-core';
import { KNNClassifier } from '@tensorflow-models/knn-classifier';
import { Dataset } from '../dataset/dataset.module';
import { Stream } from '../../core/stream';
import { Module } from '../../core/module';
import { Parametrable, TrainingStatus } from '../../core/types';

type StreamParams = Parametrable['parameters'];
export interface kNNParameters extends StreamParams {
  k: Stream<number>;
  epochs: Stream<number>;
}

export interface kNNOptions {
  k: number;
}

export interface kNNResults {
  label: string;
  confidences: { [key: string]: number };
}


export class kNN extends Module implements Parametrable {
  name = 'kNN';
  description = 'k Nearest Neighbours';

  parameters: kNNParameters;
  labels: string[];
  $classifier = new KNNClassifier();
  $training = new Stream<TrainingStatus>({ status: 'idle' });

  constructor({ k = 3 }: Partial<kNNOptions> = {}) {
    super();
    const epoch = 10;
    this.parameters = {
      k: new Stream(k, true),
      epochs: new Stream(epoch, true)
    };
  }

  async activateClass(dataset: Dataset, label: string): Promise<void> {
    const allInstances = await Promise.all(
      dataset.$instances.value.map((id) =>
        dataset.instanceService.get(id, { query: { $select: ['id', 'features'] } }),
      ),
    );
    dataset.$classes.value[label].forEach(id => {
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
    this.$training.set({ status: 'start' });
    setTimeout(async () => {
      this.$classifier.clearAllClasses();
        this.labels.forEach((label, i) => {
          this.activateClass(dataset, label);
          this.$training.set({
              status: 'epoch',
              epoch: 10 / this.labels.length * (i + 1),
              data: {
                accuracy: 0,
                loss: 0,
                accuracyVal: 0,
                lossVal: 0,
              }})
          console.log(i, this.$training.value);
        });
    }, 100);
  }

  clear(): void {
    delete this.$classifier;
  }

  async predict(x: number[][]): Promise<kNNResults> {
    const pred = await this.$classifier.predictClass(tensor2d(x), this.parameters.k.value);
    const label = pred.label;
    const confidences = pred.confidences;
    return { label, confidences };
  }

  // eslint-disable-next-line class-methods-use-this
  mount(): void {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }
}
