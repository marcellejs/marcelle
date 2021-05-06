import kmeans from 'ml-kmeans';
import {
  Stream,
  Model,
  ClusteringResults,
  ModelOptions,
  StoredModel,
  ObjectId,
  Instance,
} from '../../core';
import { Dataset, isDataset } from '../../dataset';
import { Catch, throwError } from '../../utils/error-handling';
import { saveBlob } from '../../utils/file-io';
import { toKebabCase } from '../../utils/string';
import { ServiceIterable } from '../../data-store/service-iterable';

export interface KMeansClusteringOptions extends ModelOptions {
  k: number;
}

function euclideanDistance(a: number[], b: number[]): number {
  // let summ = 0;
  // for (let k = 0; k < a.length; k++) {
  //   summ += Math.abs(a[k] - b[k]) ** 2;
  //   console.log(a[k], b[k], Math.abs(a[k] - b[k]) ** 2, summ);
  // }
  return (
    a
      .map((x, i) => Math.abs(x - b[i]) ** 2) // square the difference
      .reduce((sum, now) => sum + now) ** // sum
    (1 / 2)
  );
}

export class KMeansClustering extends Model<number[], ClusteringResults> {
  title = 'k-means clustering';
  serviceName = 'kmeans-clusering-models';

  parameters: {
    k: Stream<number>;
  };

  $centers: Stream<number[][]>;
  $clusters: Stream<number[]>;
  extremes: { min: number; max: number }[];
  dataset: number[][];

  constructor({ k = 3, ...rest }: Partial<KMeansClusteringOptions> = {}) {
    super(rest);
    this.parameters = {
      k: new Stream(k, true),
    };
    this.$centers = new Stream([], false);
    this.$clusters = new Stream([], false);
    this.dataset = [];
    this.start();
  }

  @Catch
  async train(
    dataset: Dataset<number[], undefined> | ServiceIterable<Instance<number[], undefined>>,
  ): Promise<void> {
    this.$training.set({ status: 'start', epochs: 1 });
    const ds = isDataset(dataset) ? dataset.items() : dataset;
    for await (const { x } of ds) {
      this.dataset.push(x[0]);
    }
    const ans = kmeans(this.dataset, this.parameters.k.value);
    this.$centers.set(ans.centroids.map((x: { centroid: [] }) => x.centroid));
    this.$clusters.set(ans.clusters);
    this.$training.set({ status: 'success' });
  }

  @Catch
  async predict(x: number[]): Promise<ClusteringResults> {
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
      confidences[`${i}`] = Math.exp(dist);
      distSum += Math.exp(dist);
    }
    // console.log('confidences', confidences, distSum, minDistance);
    // console.log('this.$centers.value', this.$centers.value);
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

  @Catch
  async batchPredict(dataset: Dataset<number[], undefined>): Promise<ClusteringResults[]> {
    // const allInstances = await dataset.getAllInstances(['features']);
    const data: number[][] = []; //allInstances.map((x) => x.features[0]);
    const ds = isDataset(dataset) ? dataset.items() : dataset;
    for await (const { x } of ds) {
      data.push(x);
    }
    const resPromises: ClusteringResults[] = [];
    for (let i = 0; i < data.length; i++) {
      this.predict(data[i]).then((result) => resPromises.push(result));
    }
    if (this.$centers.value.length === 0) {
      const e = new Error('KMeans is not trained');
      e.name = '[KMeans] Prediction Error';
      throwError(e);
    }
    return resPromises;
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
    const name = this.syncModelName || toKebabCase(this.title);
    return {
      name,
      files: [],
      metadata: {
        clusters: this.$clusters.value,
        centers: this.$centers.value,
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
