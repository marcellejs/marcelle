import type { Paginated, Service } from '@feathersjs/feathers';
import type { Tensor2D, TensorLike } from '@tensorflow/tfjs-core';
import { tensor, tensor2d } from '@tensorflow/tfjs-core';
import { KNNClassifier } from '@tensorflow-models/knn-classifier';
import {
  Stream,
  Model,
  ModelConstructor,
  Classifier,
  ClassifierResults,
  Saveable,
  StoredModel,
} from '../../core';
import { Dataset } from '../dataset/dataset.module';
import { Catch, throwError } from '../../utils/error-handling';
import { DataStore } from '../../data-store';
import { saveBlob } from '../../utils/file-io';

export interface KNNOptions {
  k: number;
}

export class KNN extends Classifier(Saveable(Model as ModelConstructor<Model>)) {
  name = 'KNN';

  static nextModelId = 0;
  modelId = `knn-${KNN.nextModelId++}`;

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

  sync(dataStore: DataStore) {
    super.sync(dataStore);
    this.dataStore.createService('knn-models');
    this.modelService = this.dataStore.service('knn-models') as Service<StoredModel>;
    this.dataStore.connect().then(() => {
      this.setupSync();
    });
    return this;
  }

  async setupSync() {
    const { total, data } = (await this.modelService.find({
      query: {
        modelName: this.modelId,
        $select: ['_id', 'id'],
        $limit: 1,
        $sort: {
          updatedAt: -1,
        },
      },
    })) as Paginated<StoredModel>;
    if (total === 1) {
      this.storedModelId = data[0].id;
    }
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

  async beforeSave(): Promise<StoredModel | null> {
    if (!this.classifier) return null;
    const dataset = this.classifier.getClassifierDataset();
    const datasetObj: Record<string, number[][]> = {};
    Object.keys(dataset).forEach((key) => {
      const data = dataset[key].arraySync();
      datasetObj[key] = data;
    });
    return {
      modelName: this.modelId,
      parameters: this.parametersSnapshot(),
      modelUrl: '',
      labels: this.labels,
      data: datasetObj,
    };
  }

  async afterLoad(s: StoredModel): Promise<void> {
    const dataset = s.data as Record<string, number[][]>;
    if (!dataset) return;
    const tensorObj: Record<string, Tensor2D> = {};
    Object.entries(dataset).forEach(([key, d]) => {
      tensorObj[key] = tensor2d(d);
    });
    this.labels = s.labels;
    this.classifier.setClassifierDataset(tensorObj);
    this.$training.set({
      status: 'loaded',
    });
  }

  download() {
    this.beforeSave().then((fileMeta) => {
      saveBlob(JSON.stringify(fileMeta), `${this.modelId}.json`, 'text/plain');
    });
  }
}
