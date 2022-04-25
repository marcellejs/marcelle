// Initializes the `users` service on path `/users`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Users as UsersNeDB } from './users-nedb.class';
import { Users as UsersMongoDB } from './users-mongodb.class';
import createModel from '../../models/users-nedb.model';
import hooks from './users.hooks';
import { HookContext } from '@feathersjs/feathers';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    users: UsersNeDB & ServiceAddons<any>;
  }
}

export default function (app: Application): void {
  if (!app.get('authentication').enabled) return;
  if (app.get('database') === 'nedb') {
    const options = {
      Model: createModel(app),
      paginate: app.get('paginate'),
      multi: true,
    };

    // Initialize our service with any options it requires
    app.use('/users', new UsersNeDB(options, app));
  } else if (app.get('database') === 'mongodb') {
    const options = {
      paginate: app.get('paginate'),
      multi: true,
    };

    // Initialize our service with any options it requires
    app.use('/users', new UsersMongoDB(options, app));
  } else {
    throw new Error('Invalid database type: only "nedb" or "mongodb" are currently supported');
  }

  // Get our initialized service so that we can register hooks
  const service = app.service('users');

  service.hooks(hooks);

  // if (app.get('authentication').enabled) {
  //   service.publish((data, context: HookContext) => {
  //     return [
  //       app.channel('admins'),
  //       app
  //         .channel(app.channels)
  //         .filter((connection) => connection.user._id.equals(context?.params?.user?._id)),
  //     ];
  //   });
  // }
}
