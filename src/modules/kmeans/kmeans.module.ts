import type { TensorLike } from '@tensorflow/tfjs-core';
import kmeans from 'ml-kmeans';
import { Stream, Model, ClusteringResults, ModelOptions } from '../../core';
import { Dataset } from '../dataset/dataset.module';
import { Catch, throwError } from '../../utils/error-handling';

export interface KMeansOptions extends ModelOptions {
  k: number;
  steps: number;
}

export class KMeans extends Model<number[], ClusteringResults> {
  title = 'k-means';

  parameters: {
    k: Stream<number>;
    steps: Stream<number>;
  };
  serviceName = 'knn-models';

  $centers: Stream<number[][]>;
  $clusters: Stream<number[]>;
  extremes: { min: number; max: number }[];

  constructor({ k = 3, steps = 10, ...rest }: Partial<KMeansOptions> = {}) {
    super(rest);
    this.parameters = {
      k: new Stream(k, true),
      steps: new Stream(steps, true),
    };
    this.$centers = new Stream([], false);
    this.$clusters = new Stream([], false);
  }

  @Catch
  train(dataset: Dataset): void {
    this.$training.set({ status: 'start', epochs: this.parameters.steps.value });
    setTimeout(async () => {
      const allInstances = await dataset.getAllInstances(['features']);
      const allInstacesAsArray = allInstances.map((x) => x.features[0]);

      this.initCenters(allInstacesAsArray, this.parameters.k.value);
      const ans = kmeans(allInstacesAsArray, this.parameters.k.value, {
        initialization: this.$centers.value,
      });
      this.$centers.set(ans.centroids.map((x) => x.centroid));
      this.$clusters.set(ans.clusters);
      this.$training.set({ status: 'success' });
    }, 100);
  }

  initCenters(points: number[][], n_centers: number): void {
    this.extremes = [];
    for (let j = 0; j < points[0].length; j++) {
      this.extremes.push({ min: 10000, max: -10000 });
    }
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      for (let j = 0; j < point.length; j++) {
        if (point[j] < this.extremes[j].min) {
          this.extremes[j].min = point[j];
        }
        if (point[j] > this.extremes[j].max) {
          this.extremes[j].max = point[j];
        }
      }
    }
    const tmpCenters = [];
    if (n_centers !== 0) {
      for (let k = 0; k < n_centers; k++) {
        const center = [];
        for (let i = 0; i < this.extremes.length; i++) {
          center.push(
            this.extremes[i].min +
              ((k + 1) * (this.extremes[i].max - this.extremes[i].min)) / (n_centers + 1),
          );
        }
        tmpCenters.push(center);
      }
      this.$centers.set(tmpCenters);
    }
  }

  @Catch
  async predict(x: TensorLike): Promise<ClusteringResults> {
    if (this.$centers.value.length === 0) {
      const e = new Error('KMeans is not trained');
      e.name = '[KMeans] Prediction Error';
      throwError(e);
    }
    const cluster = kmeans.predict(x.valueOf());
    const confidences = { 0: 1 };
    // const { label, confidences } = await this.classifier.predictClass(
    //   tensor(x),
    //   this.parameters.k.value,
    // );
    return { cluster, confidences };
  }

  // async activateClass(dataset: Dataset, label: string): Promise<void> {
  //   const allInstances = await Promise.all(
  //     dataset.$instances.value.map((id) =>
  //       dataset.instanceService.get(id, { query: { $select: ['id', 'features'] } }),
  //     ),
  //   );
  //   dataset.$classes.value[label].forEach((id) => {
  //     const { features } = allInstances.find((x) => x.id === id) as { features: number[][] };
  //     this.classifier.addExample(tensor2d(features), label);
  //   });
  // }

  // clear(): void {
  //   delete this.classifier;
  // }

  async save(update: boolean, metadata?: Record<string, unknown>) {
    console.log('TODO: save model');
    //   const storedModel = await this.write(metadata);
    //   return this.saveToDatastore(storedModel, update);
  }

  // async load(id?: ObjectId): Promise<StoredModel> {
  //   const storedModel = await this.loadFromDatastore(id);
  //   await this.read(storedModel);
  //   return storedModel;
  // }

  // async download(metadata?: Record<string, unknown>) {
  //   const model = await this.write(metadata);
  //   saveBlob(JSON.stringify(model), `${model.name}.json`, 'text/plain');
  // }

  // async upload(...files: File[]): Promise<StoredModel> {
  //   const jsonFiles = files.filter((x) => x.name.includes('.json'));
  //   const model = await new Promise((resolve: (o: StoredModel) => void, reject) => {
  //     const reader = new FileReader();
  //     reader.onload = () => {
  //       const obj = JSON.parse(reader.result as string);
  //       resolve(obj);
  //     };
  //     reader.onerror = reject;
  //     reader.readAsText(jsonFiles[0]);
  //   });
  //   await this.read(model);
  //   return model;
  // }

  // private async write(metadata: Record<string, unknown> = {}): Promise<StoredModel | null> {
  //   if (!this.classifier) return null;
  //   const dataset = this.classifier.getClassifierDataset();
  //   const datasetObj: Record<string, number[][]> = {};
  //   Object.keys(dataset).forEach((key) => {
  //     const data = dataset[key].arraySync();
  //     datasetObj[key] = data;
  //   });
  //   const name = this.syncModelName || toKebabCase(this.title);
  //   return {
  //     name,
  //     url: '',
  //     metadata: {
  //       labels: this.labels,
  //       data: datasetObj,
  //       // parameters: this.parametersSnapshot()
  //       ...metadata,
  //     },
  //   };
  // }

  // private async read(s: StoredModel): Promise<void> {
  //   const dataset = s.metadata.data as Record<string, number[][]>;
  //   if (!dataset) return;
  //   const tensorObj: Record<string, Tensor2D> = {};
  //   Object.entries(dataset).forEach(([key, d]) => {
  //     tensorObj[key] = tensor2d(d);
  //   });
  //   this.labels = s.metadata.labels as string[];
  //   this.classifier.setClassifierDataset(tensorObj);
  //   this.$training.set({
  //     status: 'loaded',
  //   });
  // }
}
