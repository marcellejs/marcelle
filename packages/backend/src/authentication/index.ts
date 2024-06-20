// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService } from '@feathersjs/authentication';
import { LocalStrategy } from '@feathersjs/authentication-local';

import type { Application } from '../declarations';
import authenticationHooks from './authentication.hooks';
import { AnonymousStrategy } from './anonymous';
import { MyJwtStrategy } from './jwt';

declare module '../declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService;
  }
}

export const authentication = (app: Application) => {
  const auth = new AuthenticationService(app);

  auth.register('jwt', new MyJwtStrategy());
  auth.register('local', new LocalStrategy());
  auth.register('anonymous', new AnonymousStrategy());

  app.use('authentication', auth);
  app.service('authentication').hooks(authenticationHooks);
};
