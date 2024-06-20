// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations';
import { user } from './users/users';
import { assets } from './assets/assets';
import { mlModels } from './ml-models/ml-models';
import { dynamic } from './dynamic/dynamic';
import { info } from './info/info';

export const services = (app: Application) => {
  if (app.get('authentication').enabled) {
    app.configure(user);
  }
  app.configure(assets);
  app.configure(mlModels('tfjs'));
  app.configure(mlModels('onnx'));
  app.configure(dynamic);
  app.configure(info);
  // All services will be registered here
};
