/* eslint-disable max-classes-per-file */
import type { Paginated, Service } from '@feathersjs/feathers';
import { LayersModel, loadLayersModel, Sequential } from '@tensorflow/tfjs-layers';
import { GraphModel, loadGraphModel } from '@tensorflow/tfjs-converter';
import { io } from '@tensorflow/tfjs-core';
import type { DataStore } from '../../data-store';
import type { StoredModel } from '../types';
import { Model, ModelConstructor } from './model';
import { Classifier } from './classifier';
import { DataStoreBackend } from '../../data-store/data-store';
import { ObjectDetector } from './object-detector';
import { Saveable } from './saveable';
import { saveBlob } from '../../utils/file-io';

export abstract class TFJSModel extends Saveable(Model as ModelConstructor<Model>) {
  abstract model: LayersModel | GraphModel | Sequential;
  abstract loadFn: typeof loadLayersModel | typeof loadGraphModel;

  sync(dataStore: DataStore) {
    super.sync(dataStore);
    // this.dataStore.createService('tfjs-models');
    this.modelService = this.dataStore.service('tfjs-models') as Service<StoredModel>;
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

  async beforeSave(): Promise<StoredModel | null> {
    if (!this.model) return null;
    let modelUrl: string;
    if (this.dataStore.backend === DataStoreBackend.LocalStorage) {
      await this.model.save(`indexeddb://${this.modelId}`);
      modelUrl = `indexeddb://${this.modelId}`;
    } else if (this.dataStore.backend === DataStoreBackend.Remote) {
      const requestOpts: { requestInit?: unknown } = {};
      if (this.dataStore.requiresAuth) {
        const jwt = await this.dataStore.feathers.authentication.getAccessToken();
        const headers = new Headers({ Authorization: `Bearer ${jwt}` });
        requestOpts.requestInit = { headers };
      }
      const files = await this.model
        .save(io.http(`${this.dataStore.location}/tfjs-models/upload`, requestOpts))
        .then((res) => {
          return res.responses[0].json();
        });
      modelUrl = files['model.json'];
    }
    return {
      modelName: this.modelId,
      parameters: this.parametersSnapshot(),
      modelUrl,
    };
  }

  async afterLoad(s: StoredModel): Promise<void> {
    if (this.dataStore.backend === DataStoreBackend.LocalStorage) {
      this.model = (await this.loadFn(s.modelUrl)) as Sequential;
    } else if (this.dataStore.backend === DataStoreBackend.Remote) {
      const requestOpts: { requestInit?: unknown } = {};
      if (this.dataStore.requiresAuth) {
        const jwt = await this.dataStore.feathers.authentication.getAccessToken();
        const headers = new Headers({ Authorization: `Bearer ${jwt}` });
        requestOpts.requestInit = { headers };
      }
      this.model = (await this.loadFn(
        `${this.dataStore.location}/tfjs-models/${s.modelUrl}`,
        requestOpts,
      )) as Sequential;
    }
  }

  prepareDownload() {
    return {
      modelType: 'tfjs-model',
      modelName: this.modelId,
      parameters: this.parametersSnapshot(),
    };
  }

  download() {
    const dateSaved = new Date(Date.now());
    const fileMeta = this.prepareDownload();
    this.model.save(
      io.withSaveHandler(async (data) => {
        const weightsManifest = {
          modelTopology: data.modelTopology,
          weightsManifest: [
            {
              paths: [`./${this.modelId}.weights.bin`],
              weights: data.weightSpecs,
            },
          ],
          marcelle: fileMeta,
        };
        await saveBlob(data.weightData, `${this.modelId}.weights.bin`, 'application/octet-stream');
        await saveBlob(JSON.stringify(weightsManifest), `${this.modelId}.json`, 'text/plain');
        return { modelArtifactsInfo: { dateSaved, modelTopologyType: 'JSON' } };
      }),
    );
  }
}

export abstract class TFJSClassifier extends Classifier(TFJSModel as ModelConstructor<TFJSModel>) {
  async beforeSave(): Promise<StoredModel | null> {
    const modelData = await super.beforeSave();
    modelData.labels = this.labels;
    return modelData;
  }

  async afterLoad(s: StoredModel): Promise<void> {
    await super.afterLoad(s);
    this.labels = s.labels;
  }

  prepareDownload() {
    const fileMeta = super.prepareDownload();
    return { ...fileMeta, labels: this.labels };
  }
}

export abstract class TFJSObjectDetector extends ObjectDetector(
  TFJSModel as ModelConstructor<TFJSModel>,
) {
  async beforeSave(): Promise<StoredModel | null> {
    const modelData = await super.beforeSave();
    modelData.labels = this.labels;
    return modelData;
  }

  async afterLoad(s: StoredModel): Promise<void> {
    await super.afterLoad(s);
    this.labels = s.labels;
  }

  prepareDownload() {
    const fileMeta = super.prepareDownload();
    return { ...fileMeta, labels: this.labels };
  }
}
