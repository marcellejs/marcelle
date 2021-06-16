import { tensor, tensor2d, Tensor2D, TensorLike } from '@tensorflow/tfjs-core';
import { KNNClassifier as TfjsKNNClassifier } from '@tensorflow-models/knn-classifier';
import {
  Stream,
  Model,
  ClassifierResults,
  StoredModel,
  ObjectId,
  ModelOptions,
  Instance,
} from '../../core';
import { Dataset, isDataset } from '../../core/dataset';
import { Catch } from '../../utils/error-handling';
import { saveBlob } from '../../utils/file-io';
import { toKebabCase } from '../../utils/string';
import { ServiceIterable } from '../../core/data-store/service-iterable';

export interface KNNClassifierOptions extends ModelOptions {
  k: number;
}

export class KNNClassifier extends Model<TensorLike, ClassifierResults> {
  title = 'KNN classifier';

  parameters: {
    k: Stream<number>;
  };
  serviceName = 'knn-classifier-models';

  classifier = new TfjsKNNClassifier();
  labels: string[];

  constructor({ k = 3, ...rest }: Partial<KNNClassifierOptions> = {}) {
    super(rest);
    this.parameters = {
      k: new Stream(k, true),
    };
  }

  @Catch
  async train(
    dataset: Dataset<TensorLike, string> | ServiceIterable<Instance<TensorLike, string>>,
  ): Promise<void> {
    this.labels = isDataset(dataset)
      ? await dataset.distinct('y')
      : (this.labels = Array.from(new Set(await dataset.map(({ y }) => y).toArray())));
    const ds = isDataset(dataset) ? dataset.items() : dataset;
    if (this.labels.length < 1) {
      this.$training.set({ status: 'error' });
      throw new Error('Cannot train a kNN with no classes');
    }
    this.$training.set({ status: 'start', epochs: 1 });
    setTimeout(async () => {
      this.classifier.clearAllClasses();
      for await (const { x, y } of ds) {
        this.classifier.addExample(tensor(x), y);
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
