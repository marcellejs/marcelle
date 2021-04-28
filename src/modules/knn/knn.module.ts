import { tensor, tensor2d, Tensor2D, TensorLike } from '@tensorflow/tfjs-core';
import { KNNClassifier } from '@tensorflow-models/knn-classifier';
import { Stream, Model, ClassifierResults, StoredModel, ObjectId, ModelOptions } from '../../core';
import { Dataset } from '../../dataset';
import { Catch } from '../../utils/error-handling';
import { saveBlob } from '../../utils/file-io';
import { toKebabCase } from '../../utils/string';

export interface KNNOptions extends ModelOptions {
  k: number;
}

export class KNN extends Model<TensorLike, ClassifierResults> {
  title = 'KNN';

  parameters: {
    k: Stream<number>;
  };
  serviceName = 'knn-models';

  classifier = new KNNClassifier();
  labels: string[];

  constructor({ k = 3, ...rest }: Partial<KNNOptions> = {}) {
    super(rest);
    this.parameters = {
      k: new Stream(k, true),
    };
  }

  @Catch
  train(dataset: Dataset, inputField = 'features'): void {
    this.labels = dataset.$labels.value;
    if (this.labels.length < 1) {
      this.$training.set({ status: 'error' });
      throw new Error('Cannot train a kNN with no classes');
    }
    this.$training.set({ status: 'start', epochs: this.labels.length });
    setTimeout(async () => {
      this.classifier.clearAllClasses();
      for (const [i, label] of this.labels.entries()) {
        await this.activateClass(dataset, label, inputField);
        this.$training.set({
          status: 'epoch',
          epoch: i,
          epochs: this.labels.length,
        });
      }
      this.$training.set({ status: 'success' });
    }, 100);
  }

  @Catch
  async predict(x: TensorLike): Promise<ClassifierResults> {
    if (!this.classifier || !this.labels || this.labels.length < 1) {
      return { label: undefined, confidences: {} };
    }
    const { label, confidences } = await this.classifier.predictClass(
      tensor(x),
      this.parameters.k.value,
    );
    return { label, confidences };
  }

  async activateClass(dataset: Dataset, label: string, inputField = 'features'): Promise<void> {
    const allInstances = await dataset
      .items()
      .query({ label })
      .select(['id', inputField])
      .toArray();
    for (const id of dataset.$classes.value[label]) {
      const instance = allInstances.find((x) => x.id === id) as {
        [inputField: string]: number[][];
      };
      this.classifier.addExample(tensor2d(instance[inputField]), label);
    }
  }

  clear(): void {
    delete this.classifier;
  }

  async save(
    name: string,
    metadata?: Record<string, unknown>,
    id: ObjectId = null,
  ): Promise<ObjectId> {
    const storedModel = await this.write(metadata);
    storedModel.name = name;
    return this.saveToDatastore(storedModel, id);
  }

  async load(idOrName?: ObjectId | string): Promise<StoredModel> {
    const storedModel = await this.loadFromDatastore(idOrName);
    await this.read(storedModel);
    return storedModel;
  }

  async download(metadata?: Record<string, unknown>): Promise<void> {
    const model = await this.write(metadata);
    saveBlob(JSON.stringify(model), `${model.name}.json`, 'text/plain');
  }

  async upload(...files: File[]): Promise<StoredModel> {
    const jsonFiles = files.filter((x) => x.name.includes('.json'));
    const model = await new Promise((resolve: (o: StoredModel) => void, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const obj = JSON.parse(reader.result as string);
        resolve(obj);
      };
      reader.onerror = reject;
      reader.readAsText(jsonFiles[0]);
    });
    await this.read(model);
    return model;
  }

  private async write(metadata: Record<string, unknown> = {}): Promise<StoredModel | null> {
    if (!this.classifier) return null;
    const dataset = this.classifier.getClassifierDataset();
    const datasetObj: Record<string, number[][]> = {};
    for (const key of Object.keys(dataset)) {
      const data = dataset[key].arraySync();
      datasetObj[key] = data;
    }
    const name = this.syncModelName || toKebabCase(this.title);
    return {
      name,
      files: [],
      metadata: {
        labels: this.labels,
        data: datasetObj,
        // parameters: this.parametersSnapshot()
        ...metadata,
      },
    };
  }

  private async read(s: StoredModel): Promise<void> {
    const dataset = s.metadata.data as Record<string, number[][]>;
    if (!dataset) return;
    const tensorObj: Record<string, Tensor2D> = {};
    for (const [key, d] of Object.entries(dataset)) {
      tensorObj[key] = tensor2d(d);
    }

    this.labels = s.metadata.labels as string[];
    this.classifier.setClassifierDataset(tensorObj);
    this.$training.set({
      status: 'loaded',
    });
  }
}
