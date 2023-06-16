// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Id, NullableId, Paginated, ServiceInterface } from '@feathersjs/feathers';
import type { AdapterId, MongoDBAdapterParams } from '@feathersjs/mongodb';
import { Forbidden } from '@feathersjs/errors';

import type { Application } from '../../declarations';
import { GenericService, getOptions as getGenericOptions } from './generic.class';
import { genericHooks } from './generic.hooks';

type Dynamic = any;
type DynamicData = any;
type DynamicPatch = any;
type DynamicQuery = any;

export type { Dynamic, DynamicData, DynamicPatch, DynamicQuery };

export interface DynamicServiceOptions {
  app: Application;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DynamicParams extends MongoDBAdapterParams<DynamicQuery> {}

export const genericMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class DynamicService<ServiceParams extends DynamicParams = DynamicParams>
  implements ServiceInterface<Dynamic, DynamicData, ServiceParams, DynamicPatch>
{
  constructor(public options: DynamicServiceOptions) {}

  async find(params?: ServiceParams): Promise<Paginated<Dynamic> | Dynamic[]> {
    return this.getService(params?.route?.serviceName).find(params);
  }

  async get(id: Id, params?: ServiceParams): Promise<Dynamic> {
    return this.getService(params?.route?.serviceName).get(id, params);
  }

  async create(data: DynamicData, params?: ServiceParams): Promise<Dynamic>;
  async create(data: DynamicData[], params?: ServiceParams): Promise<Dynamic[]>;
  async create(
    data: DynamicData | DynamicData[],
    params?: ServiceParams,
  ): Promise<Dynamic | Dynamic[]> {
    return this.getService(params?.route?.serviceName).create(data, params);
  }

  // This method has to be added to the 'methods' option to make it available to clients
  async update(id: NullableId, data: DynamicData, params?: ServiceParams): Promise<Dynamic> {
    return this.getService(params?.route?.serviceName).update(id as AdapterId, data, params);
  }

  async patch(id: NullableId, data: DynamicPatch, params?: ServiceParams): Promise<Dynamic> {
    return this.getService(params?.route?.serviceName).patch(id, data, params);
  }

  async remove(id: NullableId, params?: ServiceParams): Promise<Dynamic> {
    return this.getService(params?.route?.serviceName).remove(id, params);
  }

  getService(name: string): GenericService {
    const allowedServices = this.options.app.get('whitelist').services;
    if (Array.isArray(allowedServices) && !allowedServices.includes(name)) {
      throw new Forbidden('Service is unauthorized', name);
    }
    const app = this.options.app;
    try {
      app.service(name as '*');
    } catch (error) {
      // if (app.get('database') === 'nedb') {
      //   const options = {
      //     Model: createModel(app, name),
      //     paginate: app.get('paginate'),
      //     multi: true,
      //     whitelist: ['$not', '$and', '$distinct'],
      //   };
      //   app.use(name as '*', new GenericNeDB(options, app));
      // } else if (app.get('database') === 'mongodb') {
      // const options = {
      //   paginate: app.get('paginate'),
      //   multi: true,
      //   whitelist: ['$not', '$and', '$distinct'],
      // };
      app.use(name as '*', new GenericService(getGenericOptions(app, name)), {
        // A list of all methods this service exposes externally
        methods: genericMethods,
        // You can add additional custom events to be sent to clients here
        events: [],
      });
      // } else {
      //   throw new Error('Invalid database type: only "nedb" or "mongodb" are currently supported');
      // }

      const service = app.service(name as '*') as any;
      // Register our service on the Feathers application
      service.hooks(genericHooks('mongodb', false));

      // const h = hooks(app.get('database'), app.get('authentication').enabled);
      // service.hooks(h);
    }

    return app.service(name as '*');
  }
}

export const getOptions = (app: Application) => {
  return { app };
};
