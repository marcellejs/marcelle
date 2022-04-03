import debuggerService from 'feathers-debugger-service';
import { Application } from '../declarations';
import assets from './assets/assets.service';
import models from './models/models.service';
import users from './users/users.service';
import dynamicService from './generic/dynamic.service';
import infoService from './info/info.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application): void {
  // enable it only on development
  if (process.env.NODE_ENV !== 'production') {
    // the service comes with default options predefined,
    // you can override it if you wish to, see Options below
    app.configure(
      debuggerService({
        filename: `${app.get('nedb')}/debug.db`,
      }),
    );
  }

  const allowedAssets = app.get('whitelist').assets;
  if (!Array.isArray(allowedAssets) || allowedAssets.length > 0) {
    app.configure(assets);
  }
  const allowedServices = app.get('whitelist').services;
  if (!Array.isArray(allowedServices) || allowedServices.includes('tfjs-models')) {
    app.configure(models('tfjs'));
  }
  if (!Array.isArray(allowedServices) || allowedServices.includes('onnx-models')) {
    app.configure(models('onnx'));
  }
  if (app.get('authentication').enabled) {
    app.configure(users);
  }
  app.configure(infoService);
  app.configure(dynamicService);
}
