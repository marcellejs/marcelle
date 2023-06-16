import { dynamic } from './dynamic/dynamic';
import { info } from './info/info';
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations';

export const services = (app: Application) => {
  app.configure(dynamic);
  app.configure(info);
  // All services will be registered here
};
