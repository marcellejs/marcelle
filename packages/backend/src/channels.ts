/* eslint-disable no-param-reassign */
// For more information about this file see https://dove.feathersjs.com/guides/cli/channels.html
import type { RealTimeConnection, Params } from '@feathersjs/feathers';
import type { AuthenticationResult } from '@feathersjs/authentication';
import '@feathersjs/transport-commons';
import type { Application, HookContext } from './declarations';
import { AnyData, getChannelsWithReadAbility, makeChannelOptions } from 'feathers-casl';

export const channels = (app: Application) => {
  app.on('connection', (connection: RealTimeConnection) => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection);
  });

  app.on('login', (authResult: AuthenticationResult, { connection }: Params) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if (connection) {
      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection);

      if (authResult.ability) {
        connection.ability = authResult.ability;
        connection.rules = authResult.rules;
      }
    }
  });

  // TODO: CASL
  const caslOptions = makeChannelOptions(app);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.publish((data: AnyData, context: HookContext) => {
    // Here you can add event publishers to channels set up in `channels.js`
    // To publish only for a specific event use `app.publish(eventname, () => {})`

    // e.g. to publish all service events to all authenticated users use
    if (app.get('authentication').enabled) {
      return getChannelsWithReadAbility(app, data, context, caslOptions);
    }
    return app.channel('anonymous', 'authenticated');
  });
};
