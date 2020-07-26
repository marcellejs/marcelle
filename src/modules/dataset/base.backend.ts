import { Service } from '@feathersjs/feathers';
import type { Instance } from '../../core/types';
import {
  addObjectId,
  dataURL2ImageData,
  imageData2DataURL,
  addDatasetName,
  limitToDataset,
  renameIdField,
} from './hooks';

export class BaseBackend {
  instances: Service<Instance>;

  protected convertImageData = false;
  protected generateId = false;

  constructor(public name: string) {}

  setupHooks(): void {
    this.instances.hooks({
      before: {
        create: [
          addDatasetName(this.name),
          this.generateId && addObjectId,
          this.convertImageData && imageData2DataURL,
        ].filter((x) => !!x),
        find: [limitToDataset(this.name)],
        get: [limitToDataset(this.name)],
        update: [limitToDataset(this.name)],
        patch: [limitToDataset(this.name)],
        remove: [limitToDataset(this.name)],
      },
      after: {
        find: [renameIdField, this.convertImageData && dataURL2ImageData].filter((x) => !!x),
        get: [renameIdField, this.convertImageData && dataURL2ImageData].filter((x) => !!x),
        update: [renameIdField],
        patch: [renameIdField],
        remove: [renameIdField],
      },
    });
  }
}
