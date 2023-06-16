// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import {
  MongoDBService,
  type MongoDBAdapterOptions,
  type MongoDBAdapterParams,
} from '@feathersjs/mongodb';

import type { Application } from '../../declarations';

type Generic = any;
type GenericData = any;
type GenericPatch = any;
type GenericQuery = any;

export type { Generic, GenericData, GenericPatch, GenericQuery };

export interface GenericServiceOptions {
  app: Application;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GenericParams extends MongoDBAdapterParams<GenericQuery> {}

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class GenericService<ServiceParams extends Params = GenericParams> extends MongoDBService<
  Generic,
  GenericData,
  GenericParams,
  GenericPatch
> {}

export const getOptions = (app: Application, serviceName: string): MongoDBAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    multi: true,
    whitelist: ['$not', '$and', '$distinct'],
    Model: app.get('mongodbClient').then((db) => db.collection(serviceName)),
  };
};
