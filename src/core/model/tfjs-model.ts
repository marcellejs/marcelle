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
import { Saveable, HookContext } from './saveable';
import { saveBlob } from '../../utils/file-io';

export abstract class TFJSModel extends Saveable(Model as ModelConstructor<Model>) {
  abstract model: LayersModel | GraphModel | Sequential;
  abstract loadFn: typeof loadLayersModel | typeof loadGraphModel;

  constructor(...args: any[]) {
    super(...args);
    this.registerHook('save', 'before', async (context) => {
      context.model = await this.beforeSave();
      return context;
    });
    this.registerHook('load', 'after', async (context) => {
      await this.afterLoad(context.model);
      return context;
    });
    this.registerHook('download', 'before', async (context) => {
      context.meta = {
        ...context.meta,
        modelType: 'tfjs-model',
        modelName: this.modelId,
        parameters: this.parametersSnapshot(),
      };
      return context;
    });
  }

  sync(dataStore: DataStore) {
    super.sync(dataStore);
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
        $select: ['id'],
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

  async download() {
    const { model, meta } = await this.processHooks('download', 'before');
    meta.labels = model.labels;
    const dateSaved = new Date(Date.now());
    await this.model.save(
      io.withSaveHandler(async (data) => {
        const weightsManifest = {
          modelTopology: data.modelTopology,
          weightsManifest: [
            {
              paths: [`./${this.modelId}.weights.bin`],
              weights: data.weightSpecs,
            },
          ],
          marcelle: meta,
        };
        await saveBlob(data.weightData, `${this.modelId}.weights.bin`, 'application/octet-stream');
        await saveBlob(JSON.stringify(weightsManifest), `${this.modelId}.json`, 'text/plain');
        return { modelArtifactsInfo: { dateSaved, modelTopologyType: 'JSON' } };
      }),
    );
    await this.processHooks('download', 'after', { meta });
  }

  async upload(...files: File[]): Promise<void> {
    await this.processHooks('upload', 'before');
    const jsonFiles = files.filter((x) => x.name.includes('.json'));
    const weightFiles = files.filter((x) => x.name.includes('.bin'));
    const { marcelle: meta } = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const obj = JSON.parse(reader.result as string);
        resolve(obj);
      };
      reader.onerror = reject;
      reader.readAsText(jsonFiles[0]);
    });
    if (jsonFiles.length === 1 && files.length) {
      this.model = await this.loadFn(io.browserFiles([jsonFiles[0], ...weightFiles]));
      await this.processHooks('upload', 'after', { meta });
      this.save();
    } else {
      await this.processHooks('upload', 'after', { meta });
      const e = new Error('The provided files are not compatible with this model');
      e.name = 'File upload error';
      throw e;
    }
  }
}

export abstract class TFJSClassifier extends Classifier(TFJSModel as ModelConstructor<TFJSModel>) {
  constructor(...args: any[]) {
    super(...args);
    const beforeHook = async (context: HookContext) => {
      context.model = { ...context.model, labels: this.labels };
      return context;
    };
    const afterHook = async (context: HookContext) => {
      if (context.model && context.model.labels) {
        this.labels = context.model.labels;
      }
      if (context.meta && context.meta.labels) {
        this.labels = context.meta.labels;
      }
      return context;
    };
    this.registerHook('save', 'before', beforeHook);
    this.registerHook('load', 'after', afterHook);
    this.registerHook('download', 'before', beforeHook);
    this.registerHook('upload', 'after', afterHook);
  }
}

export abstract class TFJSObjectDetector extends ObjectDetector(
  TFJSModel as ModelConstructor<TFJSModel>,
) {
  constructor(...args: any[]) {
    super(...args);
    const beforeHook = async (context: HookContext) => {
      context.model = { ...context.model, labels: this.labels };
      return context;
    };
    const afterHook = async (context: HookContext) => {
      if (context.model && context.model.labels) {
        this.labels = context.model.labels;
      }
      if (context.meta && context.model.labels) {
        this.labels = context.model.labels;
      }
      return context;
    };
    this.registerHook('save', 'before', beforeHook);
    this.registerHook('load', 'after', afterHook);
    this.registerHook('download', 'before', beforeHook);
    this.registerHook('upload', 'after', afterHook);
  }
}
