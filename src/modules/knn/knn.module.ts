import { tensor, tensor2d, TensorLike } from '@tensorflow/tfjs-core';
import { KNNClassifier } from '@tensorflow-models/knn-classifier';
import { Dataset } from '../dataset/dataset.module';
import { Stream } from '../../core/stream';
import { Classifier, ClassifierResults } from '../../core/classifier';
import { Catch, throwError } from '../../utils/error-handling';
import { DataStore, DataStoreBackend } from '../../data-store/data-store';

export interface KNNOptions {
  k: number;
  dataStore: DataStore;
}

export class KNN extends Classifier<TensorLike, ClassifierResults> {
  name = 'KNN';
  description = 'K-Nearest Neighbours';

  static nextModelId = 0;
  modelId = `knn-${KNN.nextModelId++}`;

  parameters: {
    k: Stream<number>;
  };
  classifier = new KNNClassifier();

  constructor({ k = 3, dataStore = new DataStore() }: Partial<KNNOptions> = {}) {
    super(dataStore);
    this.parameters = {
      k: new Stream(k, true),
    };
    this.load().catch(() => {});
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
      await Promise.all(
        this.labels.map(async (label, i) => {
          await this.activateClass(dataset, label);
          this.$training.set({
            status: 'epoch',
            epoch: i,
            epochs: this.labels.length,
          });
        }),
      );
      this.$training.set({ status: 'success' });
      this.save();
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

  @Catch
  async save() {
    if (!this.classifier) return;
    const dataset = this.classifier.getClassifierDataset();
    const datasetObj: Record<string, number[][]> = {};
    Object.keys(dataset).forEach((key) => {
      const data = dataset[key].arraySync();
      datasetObj[key] = data;
    });
    const jsonStr = JSON.stringify(datasetObj);
    if (this.dataStore.backend === DataStoreBackend.LocalStorage) {
      localStorage.setItem(`marcelle:${this.modelId}:dataset`, jsonStr);
      // localStorage.setItem(`marcelle:${this.modelId}:labels`, JSON.stringify(this.labels));
    } else if (this.dataStore.backend === DataStoreBackend.Remote) {
      throwError(new Error('Remote model saving is not yet implemented'));
    }
  }

  async load() {
    if (this.dataStore.backend === DataStoreBackend.LocalStorage) {
      const dataset = localStorage.getItem(`marcelle:${this.modelId}:dataset`);
      if (!dataset) return;
      const tensorObj = JSON.parse(dataset);
      Object.keys(tensorObj).forEach((key) => {
        tensorObj[key] = tensor2d(tensorObj[key]);
      });
      this.classifier.setClassifierDataset(tensorObj);
      this.$training.set({
        status: 'loaded',
      });
    } else if (this.dataStore.backend === DataStoreBackend.Remote) {
      throwError(new Error('Remote model loading is not yet implemented'));
    }
  }
}
