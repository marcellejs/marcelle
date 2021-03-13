import type { TensorLike } from '@tensorflow/tfjs-core';
import { kmeans } from 'ml-kmeans';
import { Stream, Model, ClusteringResults, ModelOptions, StoredModel, ObjectId } from '../../core';
import { Dataset } from '../dataset/dataset.module';
import { Catch, throwError } from '../../utils/error-handling';
import { saveBlob } from '../../utils/file-io';
import { toKebabCase } from '../../utils/string';

export interface KMeansOptions extends ModelOptions {
  k: number;
}

function euclideanDistance(a: number[], b: number[]): number {
  return (
    a
      .map((x, i) => Math.abs(x - b[i]) ** 2) // square the difference
      .reduce((sum, now) => sum + now) ** // sum
    (1 / 2)
  );
}

export class KMeans extends Model<number[], ClusteringResults> {
  title = 'k-means';

  parameters: {
    k: Stream<number>;
  };
  serviceName = 'knn-models';

  $centers: Stream<number[][]>;
  $clusters: Stream<number[]>;
  extremes: { min: number; max: number }[];
  dataset: number[][];

  constructor({ k = 3, ...rest }: Partial<KMeansOptions> = {}) {
    super(rest);
    this.parameters = {
      k: new Stream(k, true),
    };
    this.$centers = new Stream([], false);
    this.$clusters = new Stream([], false);
  }

  @Catch
  async train(dataset: Dataset): Promise<void> {
    this.$training.set({ status: 'start', epochs: 10 });

    const allInstances = await dataset.getAllInstances(['features']);
    this.dataset = allInstances.map((x) => x.features[0]);
    const ans = kmeans(this.dataset, this.parameters.k.value, {
      seed: 48,
    });
    this.$centers.set(ans.centroids.map((x: { centroid: [] }) => x.centroid));
    this.$clusters.set(ans.clusters);
    this.$training.set({ status: 'success' });
  }

  @Catch
  async predict(x: TensorLike): Promise<ClusteringResults> {
    let cluster = 0;
    let minDistance = 1000;
    const confidences: { [key: string]: number } = {};
    let distSum = 0;
    for (let i = 0; i < this.$centers.value.length; i++) {
      const dist = euclideanDistance(this.$centers.value[i], x[0]);
      if (dist < minDistance) {
        minDistance = dist;
        cluster = i;
      }
      confidences[`${i}`] = dist;
      distSum += dist;
    }
    Object.entries(confidences).forEach(([key]) => {
      confidences[key] /= distSum;
    });
    if (this.$centers.value.length === 0) {
      const e = new Error('KMeans is not trained');
      e.name = '[KMeans] Prediction Error';
      throwError(e);
    }
    return { cluster, confidences };
  }

  async save(update: boolean, metadata?: Record<string, unknown>) {
    const storedModel = await this.write(metadata);
    return this.saveToDatastore(storedModel, update);
  }

  async load(id?: ObjectId): Promise<StoredModel> {
    const storedModel = await this.loadFromDatastore(id);
    await this.read(storedModel);
    return storedModel;
  }

  async download(metadata?: Record<string, unknown>) {
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
    const datasetObj: Record<string, number[][]> = {};
    this.$clusters.value.forEach((value, i) => {
      if (!Object.keys(datasetObj).includes(`${value}`)) {
        datasetObj[`${value}`] = [];
      }
      datasetObj[`${value}`].push(this.dataset[i]);
    });
    const name = this.syncModelName || toKebabCase(this.title);
    return {
      name,
      url: '',
      metadata: {
        labels: this.$clusters.value,
        data: datasetObj,
        ...metadata,
      },
    };
  }

  private async read(s: StoredModel): Promise<void> {
    const dataset = s.metadata.data as Record<string, number[][]>;
    if (!dataset) return;
    const tensorObj: Record<string, number[][]> = {};
    Object.entries(dataset).forEach(([key, d]) => {
      tensorObj[key] = d;
    });
    this.$clusters.set(s.metadata.labels as number[]);
    this.$training.set({
      status: 'loaded',
    });
  }
}
