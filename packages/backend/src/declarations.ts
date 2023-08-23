// For more information about this file see https://dove.feathersjs.com/guides/cli/typescript.html
import {
  HookContext as FeathersHookContext,
  FeathersService,
  NextFunction,
  ServiceInterface,
  ServiceOptions,
} from '@feathersjs/feathers';
import { Application as FeathersApplication } from '@feathersjs/koa';

import { User } from './services/users/users';

export { NextFunction };

// The types for app.get(name) and app.set(name)
export interface Configuration {
  host: string;
  port: number;
  apiPrefix: string;
  database: 'mongodb';
  whitelist: {
    services: '*' | string[];
    assets: '*' | string[];
  };
  gridfs: boolean;
  paginate: {
    default: number;
    max: number;
  };
  public: string;
  origins: string[];
  authentication: {
    enabled: boolean;
    allowSignup: boolean;
    entity: string;
    service: string;
    secret: string;
    authStrategies: Array<'jwt' | 'local'>;
    jwtOptions: {
      header: {
        typ: 'access';
      };
      audience: string;
      algorithm: 'HS256';
      expiresIn: string;
    };
    local: {
      usernameField: string;
      passwordField: string;
    };
  };
}

// A mapping of service names to types. Will be extended in service files.
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceTypes {}

// The application instance type that will be used everywhere else
export type Application = FeathersApplication<ServiceTypes, Configuration> & {
  getService<L extends keyof ServiceTypes>(
    location: L,
  ): FeathersService<Application, ServiceTypes[L]>;
  getServicePath<L extends keyof ServiceTypes>(location: L): string;
  declareService<L extends keyof ServiceTypes>(
    location: L,
    service: keyof any extends keyof ServiceTypes
      ? ServiceInterface | Application
      : ServiceTypes[L],
    options?: ServiceOptions<keyof any extends keyof ServiceTypes ? string : keyof ServiceTypes[L]>,
  ): Application;
};

// The context for hook functions - can be typed with a service class
export type HookContext<S = any> = FeathersHookContext<Application, S>;

// Add the user as an optional property to all params
declare module '@feathersjs/feathers' {
  interface Params {
    user?: User;
  }
}
