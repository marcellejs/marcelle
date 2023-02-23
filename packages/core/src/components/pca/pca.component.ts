import { PCA as MLPCA, type PCAModel } from 'ml-pca';
import {
  type Dataset,
  type DataStore,
  type Instance,
  isDataset,
  Model,
  type ObjectId,
  type StoredModel,
} from '../../core';
import type { LazyIterable } from '../../utils';
import { saveBlob } from '../../utils/file-io';
import { toKebabCase } from '../../utils/string';

export interface PCAInstance extends Instance {
  x: number[];
  y: undefined;
}

export class PCA extends Model<PCAInstance, number[]> {
  title = 'PCA';
  serviceName = 'pca';

  parameters = {};

  model: MLPCA;

  async train(dataset: Dataset<PCAInstance> | LazyIterable<PCAInstance>): Promise<void> {
    this.$training.set({ status: 'start', epochs: -1 });

    const items = isDataset(dataset) ? dataset.items() : dataset;
    const instances = await items.toArray();
    const pcaData = instances.reduce((d, { x }) => d.concat([x]), []);

    this.model = new MLPCA(pcaData);
    this.$training.set({
      status: 'success',
      data: {
        explainedVariance: this.model.getExplainedVariance(),
      },
    });
  }

  async predict(x: number[]): Promise<number[]> {
    if (!this.model) return null;
    return this.model.predict([x]).to2DArray()[0].slice(0, 2);
  }

  clear(): void {
    this.model = null;
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
      format: 'ml-pca',
      metadata: {
        PCAModel: this.model?.toJSON(),
        ...metadata,
      },
    };
  }

  private async read(s: StoredModel): Promise<void> {
    const m = s.metadata.PCAModel as PCAModel;
    if (!m) return;
    this.model = MLPCA.load(m);
    this.$training.set({
      status: 'loaded',
    });
  }
}
