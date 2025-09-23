import { AuthenticationManagementService } from 'feathers-authentication-management';
import notifier from './notifier';
import { Application } from '../../declarations';

export function authManagement(app: Application) {
  app.use(
    'auth-management',
    new AuthenticationManagementService(app, {
      notifier: notifier(app),
      skipPasswordHash: true,
    }),
  );
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'auth-management': AuthenticationManagementService;
  }
}
