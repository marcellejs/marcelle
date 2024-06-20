// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import { MongoDBService } from '@feathersjs/mongodb';
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb';

import type { Application } from '../../declarations';
import type { MlModels, MlModelsData, MlModelsPatch, MlModelsQuery } from './ml-models.schema';
import type { ModelType } from './ml-models';

export type { MlModels, MlModelsData, MlModelsPatch, MlModelsQuery };

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MlModelsParams extends MongoDBAdapterParams<MlModelsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class MlModelsService<ServiceParams extends Params = MlModelsParams> extends MongoDBService<
  MlModels,
  MlModelsData,
  MlModelsParams,
  MlModelsPatch
> {}

export const getOptions = (app: Application, modelType: ModelType): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection(`${modelType}-models`)),
    filters: { $nor: true },
    operators: ['$nor'],
  };
};
