// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import type { Application } from '../../declarations';
import { UserService, getOptions } from './users.class';
import usersHooks from './users.hooks';

export const userPath = 'users';
export const userMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

export * from './users.class';
export * from './users.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const user = (app: Application) => {
  // Register our service on the Feathers application
  app.use(userPath, new UserService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: userMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(userPath).hooks(usersHooks);
};

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [userPath]: UserService;
  }
}
