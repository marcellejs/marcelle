import { Application } from '../../declarations';
import { Generic as GenericNeDB } from './generic-nedb.class';
import { Generic as GenericMongoDB } from './generic-mongodb.class';
import createModel from '../../models/generic-nedb.model';
import hooks from './generic.hooks';
import { Id, NullableId, Paginated, Params } from '@feathersjs/feathers';
import { Forbidden } from '@feathersjs/errors';

class DynamicService<T = any> {
  app?: Application;

  find(params: Params & { route: { serviceName: string } }): Promise<T | T[] | Paginated<T>> {
    return this.getService(params.route.serviceName).find(params);
  }

  get(id: Id, params: Params & { route: { serviceName: string } }): Promise<T> {
    return this.getService(params.route.serviceName).get(id, params);
  }

  create(
    data: Partial<T> | Array<Partial<T>>,
    params: Params & { route: { serviceName: string } },
  ): Promise<T | T[]> {
    return this.getService(params.route.serviceName).create(data, params);
  }

  update(id: Id, data: T, params: Params & { route: { serviceName: string } }): Promise<T> {
    return this.getService(params.route.serviceName).update(id, data, params);
  }

  patch(
    id: NullableId,
    data: Partial<T>,
    params: Params & { route: { serviceName: string } },
  ): Promise<T> {
    return this.getService(params.route.serviceName).patch(id, data, params);
  }

  remove(id: NullableId, params: Params & { route: { serviceName: string } }): Promise<T> {
    return this.getService(params.route.serviceName).remove(id, params);
  }

  setup(app: Application) {
    this.app = app;
  }

  getService(name: string): GenericNeDB | GenericMongoDB {
    const allowedServices = this.app?.get('whitelist').services;
    if (Array.isArray(allowedServices) && !allowedServices.includes(name)) {
      throw new Forbidden('Service is unauthorized', name);
    }
    const app = this.app as unknown as Application;
    if (!app.service(name)) {
      if (app.get('database') === 'nedb') {
        const options = {
          Model: createModel(app, name),
          paginate: app.get('paginate'),
          multi: true,
          whitelist: ['$not', '$and', '$distinct'],
        };
        app.use(`/${name}`, new GenericNeDB(options, app));
      } else if (app.get('database') === 'mongodb') {
        const options = {
          paginate: app.get('paginate'),
          multi: true,
          whitelist: ['$not', '$and', '$distinct'],
        };
        app.use(`/${name}`, new GenericMongoDB(options, app, name));
      } else {
        throw new Error('Invalid database type: only "nedb" or "mongodb" are currently supported');
      }

      const service = app.service(name) as any;

      const h = hooks(app.get('database'), app.get('authentication').enabled);
      service.hooks(h);
    }

    return app.service(name);
  }
}

export default function (app: Application): void {
  app.use('/:serviceName', new DynamicService());
}
