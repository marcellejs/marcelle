import type { LazyIterable } from '../../utils';
import { kmeans } from 'ml-kmeans';
import {
  Stream,
  Model,
  type ClusteringResults,
  type StoredModel,
  type ObjectId,
  type Instance,
  type DataStore,
} from '../../core';
import { type Dataset, isDataset } from '../../core/dataset';
import { Catch, throwError } from '../../utils/error-handling';
import { saveBlob } from '../../utils/file-io';
import { toKebabCase } from '../../utils/string';

export interface KMeansClusteringOptions {
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

export interface KMeansInstance extends Instance {
  x: number[];
  y: undefined;
}

export class KMeansClustering extends Model<KMeansInstance, ClusteringResults> {
  title = 'k-means clustering';
  serviceName = 'kmeans-models';

  parameters: {
    k: Stream<number>;
  };

  $centers: Stream<number[][]>;
  $clusters: Stream<number[]>;
  extremes: Array<{ min: number; max: number }>;
  dataset: number[][];

  constructor({ k = 3 }: Partial<KMeansClusteringOptions> = {}) {
    super();
    this.parameters = {
      k: new Stream(k, true),
    };
    this.$centers = new Stream([], false);
    this.$clusters = new Stream([], false);
    this.dataset = [];
    this.start();
  }

  @Catch
  async train(dataset: Dataset<KMeansInstance> | LazyIterable<KMeansInstance>): Promise<void> {
    this.$training.set({ status: 'start', epochs: 1 });
    const ds = isDataset(dataset) ? dataset.items() : dataset;
    for await (const { x } of ds) {
      this.dataset.push(x);
    }
    const ans = kmeans(this.dataset, this.parameters.k.get(), {});
    this.$centers.set(ans.centroids);
    this.$clusters.set(ans.clusters);
    this.$training.set({ status: 'success' });
  }

  @Catch
  async predict(x: number[]): Promise<ClusteringResults> {
    let cluster = 0;
    let minDistance = 1000;
    const confidences: Record<string, number> = {};
    let distSum = 0;
    for (let i = 0; i < this.$centers.get().length; i++) {
      const dist = euclideanDistance(this.$centers.get()[i], x);
      if (dist < minDistance) {
        minDistance = dist;
        cluster = i;
      }
      confidences[`${i}`] = Math.exp(dist);
      distSum += Math.exp(dist);
    }
    Object.entries(confidences).forEach(([key]) => {
      confidences[key] /= distSum;
    });
    if (this.$centers.get().length === 0) {
      const e = new Error('KMeans is not trained');
      e.name = '[KMeans] Prediction Error';
      throwError(e);
    }
    return { cluster, confidences };
  }

  @Catch
  async batchPredict(dataset: Dataset<KMeansInstance>): Promise<ClusteringResults[]> {
    // const allInstances = await dataset.getAllInstances(['features']);
    const data: number[][] = []; //allInstances.map((x) => x.features[0]);
    const ds = isDataset(dataset) ? dataset.items() : dataset;
    for await (const { x } of ds) {
      data.push(x);
    }
    const resPromises: ClusteringResults[] = [];
    for (const x of data) {
      this.predict(x).then((result) => resPromises.push(result));
    }
    if (this.$centers.get().length === 0) {
      const e = new Error('KMeans is not trained');
      e.name = '[KMeans] Prediction Error';
      throwError(e);
    }
    return resPromises;
  }

  async save(
    store: DataStore,
    name: string,
    metadata?: Record<string, unknown>,
    id: ObjectId = null,
  ): Promise<ObjectId> {
    const storedModel = await this.write(metadata);
    storedModel.name = name;
    return this.saveToDatastore(store, storedModel, id);
  }

  async load(store: DataStore, id?: ObjectId): Promise<StoredModel> {
    const storedModel = await this.loadFromDatastore(store, id);
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
    const name = toKebabCase(this.title);
    return {
      name,
      files: [],
      format: 'ml-kmeans',
      metadata: {
        clusters: this.$clusters.get(),
        centers: this.$centers.get(),
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
