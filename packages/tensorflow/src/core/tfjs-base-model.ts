import { type GraphModel, loadGraphModel } from '@tensorflow/tfjs-converter';
import type { DataStore, Instance, ObjectId, StoredModel } from '@marcellejs/core';
import { Catch, DataStoreBackend, Model, saveBlob } from '@marcellejs/core';
import { io, ready, Tensor, tidy, zeros } from '@tensorflow/tfjs-core';
import { LayersModel, loadLayersModel } from '@tensorflow/tfjs-layers';
import { browserFiles, http } from './tfjs-io';
import { kebabCase } from 'scule';

interface MarcelleDownloadMetadata {
  type: string;
  tfjsModelFormat: string;
  name: string;
  labels: string[];
  [key: string]: unknown;
}

export abstract class TFJSBaseModel<T extends Instance, PredictionType> extends Model<
  T,
  PredictionType
> {
  serviceName = 'tfjs-models';
  model: LayersModel | GraphModel;
  loadFn: typeof loadLayersModel | typeof loadGraphModel;
  labels?: string[];

  @Catch
  protected async warmup(): Promise<void> {
    const inputShape = this.model.inputs[0].shape.map((x) => (x && x > 0 ? x : 1));
    const warmupResult = this.model.predict(tidy(() => zeros(inputShape))) as Tensor;
    await warmupResult.data();
    warmupResult.dispose();
  }

  async save(
    store: DataStore,
    name: string,
    metadata?: Record<string, unknown>,
    id: ObjectId = null,
  ): Promise<ObjectId> {
    if (!this.model) return null;
    let files: Array<[string, string]>;
    if (store.backend === DataStoreBackend.LocalStorage) {
      await this.model.save(`indexeddb://${name}`);
      files = [['main', `indexeddb://${name}`]];
    } else if (store.backend === DataStoreBackend.Remote) {
      const requestOpts: { requestInit?: unknown } = {};
      if (store.requiresAuth) {
        const jwt = await store.feathers.authentication.getAccessToken();
        const headers = new Headers({ Authorization: `Bearer ${jwt}` });
        requestOpts.requestInit = { headers };
      }
      files = await this.model
        .save(http(`${store.location}/tfjs-models/upload`, requestOpts))
        .then((res) => res.responses[0].json());
    }

    const storedModel = {
      name,
      files,
      format: 'tfjs',
      metadata: {
        tfjsModelFormat: this.model instanceof LayersModel ? 'layers-model' : 'graph-model',
        ...(this.labels && { labels: this.labels }),
        ...metadata,
      },
    };
    return this.saveToDatastore(store, storedModel, id);
  }

  async load(store: DataStore, idOrName: ObjectId | string): Promise<StoredModel> {
    if (!idOrName) return null;
    this.$training.next({
      status: 'loading',
    });
    this.ready = false;
    await ready();
    try {
      const storedModel = await this.loadFromDatastore(store, idOrName);
      this.loadFn =
        storedModel.metadata.tfjsModelFormat === 'graph-model' ? loadGraphModel : loadLayersModel;
      let model: LayersModel | GraphModel;
      if (store.backend === DataStoreBackend.LocalStorage) {
        model = await this.loadFn(storedModel.files[0][1]);
      } else if (store.backend === DataStoreBackend.Remote) {
        const requestOpts: { requestInit?: unknown } = {};
        if (store.requiresAuth) {
          const jwt = await store.feathers.authentication.getAccessToken();
          const headers = new Headers({ Authorization: `Bearer ${jwt}` });
          requestOpts.requestInit = { headers };
        }

        model = await this.loadFn(
          http(`${store.location}/tfjs-models/${storedModel.id}/model.json`, requestOpts),
        );
      }
      if (model) {
        this.model = model;
        await this.warmup();
      }
      if (storedModel.metadata && storedModel.metadata.labels) {
        this.labels = storedModel.metadata.labels as string[];
      } else {
        // logger.log("Couldn't Find labels in the stored model's metadata");
        this.labels = undefined;
      }
      this.$training.next({
        status: 'loaded',
        data: {
          source: 'datastore',
          url: store.location,
        },
      });
      return storedModel;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('[tfjs-model] Loading error', error);
      this.$training.next({
        status: 'error',
      });
      throw error;
    }
  }

  async download(metadata?: Record<string, unknown>): Promise<void> {
    const name = kebabCase(this.title);
    const meta: MarcelleDownloadMetadata = {
      type: 'tfjs-model',
      tfjsModelFormat: this.model instanceof LayersModel ? 'layers-model' : 'graph-model',
      name,
      ...(this.labels && { labels: this.labels }),
      ...metadata,
    };
    const dateSaved = new Date(Date.now());
    await this.model.save(
      io.withSaveHandler(async (data) => {
        const weightsManifest = {
          modelTopology: data.modelTopology,
          weightsManifest: [
            {
              paths: [`./${name}.weights.bin`],
              weights: data.weightSpecs,
            },
          ],
          marcelle: meta,
        };
        await saveBlob(
          data.weightData as ArrayBuffer,
          `${name}.weights.bin`,
          'application/octet-stream',
        );
        await saveBlob(JSON.stringify(weightsManifest), `${name}.json`, 'text/plain');
        return { modelArtifactsInfo: { dateSaved, modelTopologyType: 'JSON' } };
      }),
    );
  }

  @Catch
  async upload(...files: File[]): Promise<StoredModel> {
    this.$training.next({
      status: 'loading',
    });
    try {
      const jsonFiles = files.filter((x) => x.name.includes('.json'));
      const weightFiles = files.filter((x) => x.name.includes('.bin'));
      const { marcelle: meta } = await new Promise<{ marcelle: MarcelleDownloadMetadata }>(
        (resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const obj = JSON.parse(reader.result as string);
            resolve(obj);
          };
          reader.onerror = (err) =>
            reject(new Error(`The provided files are not a valid marcelle model ${err}`));
          reader.readAsText(jsonFiles[0]);
        },
      );
      this.loadFn = meta.tfjsModelFormat === 'graph-model' ? loadGraphModel : loadLayersModel;
      if (jsonFiles.length === 1 && files.length) {
        const model = await this.loadFn(browserFiles([jsonFiles[0], ...weightFiles]));
        if (model) {
          this.model = model;
          await this.warmup();
        }
        if (meta && meta.labels) {
          this.labels = meta.labels as string[];
        } else {
          // logger.log("Couldn't Find labels in the stored model's metadata");
          this.labels = null;
        }
        this.$training.next({
          status: 'loaded',
          data: {
            source: 'file',
          },
        });
        return { name: meta.name, format: 'tfjs', files: [], metadata: meta };
      }

      const e = new Error('The provided files are not compatible with this model');
      e.name = 'File upload error';
      throw e;
    } catch (error) {
      this.$training.next({
        status: 'error',
      });
      throw error;
    }
  }
}
