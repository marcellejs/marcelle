/* eslint-disable max-classes-per-file */
import type { Paginated, Service } from '@feathersjs/feathers';
import { LayersModel, loadLayersModel, Sequential } from '@tensorflow/tfjs-layers';
import type { GraphModel } from '@tensorflow/tfjs-converter';
import { io } from '@tensorflow/tfjs-core';
import type { DataStore } from '../../data-store';
import type { StoredModel } from '../types';
import { Model, ModelConstructor } from './model';
import { Classifier } from './classifier';
import { DataStoreBackend } from '../../data-store/data-store';
import { ObjectDetector } from './object-detector';
import { Saveable } from './saveable';

export abstract class TFJSModel extends Saveable(Model as ModelConstructor<Model>) {
  abstract model: LayersModel | GraphModel | Sequential;

  constructor(dataStore?: DataStore) {
    super(dataStore);
    this.dataStore.createService('tfjs-models');
    this.modelService = this.dataStore.service('tfjs-models') as Service<StoredModel>;
    this.dataStore.connect().then(() => {
      this.tfjsSetup();
    });
  }

  async tfjsSetup() {
    const { total, data } = (await this.modelService.find({
      query: { modelName: this.modelId, $select: ['_id', 'id'] },
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
      this.model = (await loadLayersModel(s.modelUrl)) as Sequential;
    } else if (this.dataStore.backend === DataStoreBackend.Remote) {
      const requestOpts: { requestInit?: unknown } = {};
      if (this.dataStore.requiresAuth) {
        const jwt = await this.dataStore.feathers.authentication.getAccessToken();
        const headers = new Headers({ Authorization: `Bearer ${jwt}` });
        requestOpts.requestInit = { headers };
      }
      this.model = (await loadLayersModel(
        `${this.dataStore.location}/tfjs-models/${s.modelUrl}`,
        requestOpts,
      )) as Sequential;
    }
  }
}

export abstract class TFJSClassifier extends Classifier(TFJSModel as ModelConstructor<TFJSModel>) {
  async beforeSave(): Promise<StoredModel | null> {
    const modelData = await super.beforeSave();
    modelData.labels = this.labels;
    return modelData;
  }

  async afterLoad(s: StoredModel): Promise<void> {
    this.labels = s.labels;
    super.afterLoad(s);
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
    this.labels = s.labels;
    super.afterLoad(s);
  }
}
