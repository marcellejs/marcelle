// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import type { Application } from '../../declarations';
import { InfoService, getOptions } from './info.class';

export const infoPath = 'info';
export const infoMethods = ['find'] as const;

export * from './info.class';

// A configure function that registers the service and its hooks via `app.configure`
export const info = (app: Application) => {
  // Register our service on the Feathers application
  app.use(infoPath, new InfoService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: infoMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(infoPath).hooks({
    around: {
      all: [],
    },
    before: {
      all: [],
      find: [],
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
    [infoPath]: InfoService;
  }
}
