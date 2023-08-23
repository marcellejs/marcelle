// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';

import type { Application } from '../declarations';
import authenticationHooks from './authentication.hooks';

declare module '../declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService;
  }
}

export const authentication = (app: Application) => {
  const auth = new AuthenticationService(app);

  auth.register('jwt', new JWTStrategy());
  auth.register('local', new LocalStrategy());

  app.declareService('authentication', auth);
  app.getService('authentication').hooks(authenticationHooks);
};
