// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import type { Application } from '../../declarations';
import { DynamicService, getOptions } from './dynamic.class';
import { GenericService } from './generic.class';

export const dynamicPath = ':serviceName';
export const dynamicMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

export * from './dynamic.class';

// A configure function that registers the service and its hooks via `app.configure`
export const dynamic = (app: Application) => {
  // Register our service on the Feathers application
  app.declareService(dynamicPath, new DynamicService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: dynamicMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.getService(dynamicPath).hooks({
    around: {
      all: [],
    },
    before: {
      all: [],
      find: [],
      get: [],
      create: [],
      patch: [],
      remove: [],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  });
};

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [dynamicPath]: DynamicService;
    '*': GenericService;
  }
}
