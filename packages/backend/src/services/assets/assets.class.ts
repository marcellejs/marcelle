// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import { MongoDBService } from '@feathersjs/mongodb';
import type { MongoDBAdapterParams, MongoDBAdapterOptions } from '@feathersjs/mongodb';

import type { Application } from '../../declarations';

type Assets = any;
type AssetsData = any;
type AssetsPatch = any;
type AssetsQuery = any;

export type { Assets, AssetsData, AssetsPatch, AssetsQuery };

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AssetsParams extends MongoDBAdapterParams<AssetsQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class AssetsService<ServiceParams extends Params = AssetsParams> extends MongoDBService<
  Assets,
  AssetsData,
  AssetsParams,
  AssetsPatch
> {}

export const getOptions = (app: Application): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('assets')),
    filters: { $nor: true },
    operators: ['$nor'],
  };
};
