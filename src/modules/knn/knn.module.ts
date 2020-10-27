import { tensor, tensor2d, TensorLike } from '@tensorflow/tfjs-core';
import { KNNClassifier } from '@tensorflow-models/knn-classifier';
import { Dataset } from '../dataset/dataset.module';
import { Stream } from '../../core/stream';
import { Classifier, ClassifierResults } from '../../core/classifier';
import { Catch, throwError } from '../../utils/error-handling';

export interface KNNOptions {
  k: number;
}

export class KNN extends Classifier<TensorLike, ClassifierResults> {
  name = 'KNN';
  description = 'K-Nearest Neighbours';

  parameters: {
    k: Stream<number>;
  };
  classifier = new KNNClassifier();

  constructor({ k = 3 }: Partial<KNNOptions> = {}) {
    super();
    this.parameters = {
      k: new Stream(k, true),
    };
  }

  @Catch
  train(dataset: Dataset): void {
    this.labels = dataset.$labels.value;
    if (this.labels.length < 1) {
      this.$training.set({ status: 'error' });
      throw new Error('Cannot train a kNN with no classes');
    }
    this.$training.set({ status: 'start', epochs: this.labels.length });
    setTimeout(async () => {
      this.classifier.clearAllClasses();
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

  @Catch
  async predict(x: TensorLike): Promise<ClassifierResults> {
    if (!this.classifier) {
      const e = new Error('Model is not defined');
      e.name = '[KNN] Prediction Error';
      throwError(e);
    }
    const { label, confidences } = await this.classifier.predictClass(
      tensor(x),
      this.parameters.k.value,
    );
    return { label, confidences };
  }

  async activateClass(dataset: Dataset, label: string): Promise<void> {
    const allInstances = await Promise.all(
      dataset.$instances.value.map((id) =>
        dataset.instanceService.get(id, { query: { $select: ['id', 'features'] } }),
      ),
    );
    dataset.$classes.value[label].forEach((id) => {
      const { features } = allInstances.find((x) => x.id === id) as { features: number[][] };
      this.classifier.addExample(tensor2d(features), label);
    });
  }

  clear(): void {
    delete this.classifier;
  }
}
