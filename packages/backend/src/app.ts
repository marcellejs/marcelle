// import favicon from 'serve-favicon';
import compress from 'compression';
import helmet from 'helmet';
import cors from 'cors';

import feathers from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';
import casl from 'feathers-casl';

import { Application, ServiceTypes } from './declarations';
import logger from './logger';
import middleware from './middleware';
import services from './services';
import appHooks from './app.hooks';
import channels from './channels';
import authentication from './authentication';
import mongodb from './mongodb';
import { getRegisteredServices } from './utils/registered-services';
// Don't remove this comment. It's needed to format import lines nicely.

function createApp(): Application {
  const a = express(feathers()) as any;

  a.getService = function <L extends keyof ServiceTypes>(location: L): ServiceTypes[L] {
    return a.service(a.get('apiPrefix').replace(/\/$/, '') + '/' + location);
  };

  a.getServicePath = function <L extends keyof ServiceTypes>(location: L): string {
    return a.get('apiPrefix').replace(/^\/|\/$/g, '') + '/' + location;
  };

  a.declareService = function <L extends keyof ServiceTypes>(location: L, service: any) {
    const path = a.get('apiPrefix').replace(/\/$/, '') + '/' + location;
    // Initialize our service
    a.use(path, service);

    return (a as Application).getService(location);
  };

  return a as Application;
}

const app: Application = createApp();

// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(cors());
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
// app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
app.configure(
  socketio(
    {
      path: app.get('apiPrefix').replace(/\/$/, '') + '/socket.io',
    },
    function (io) {
      io.on('connection', async (socket) => {
        const registeredServices = await getRegisteredServices(app);
        socket.emit('init', {
          auth: app.get('authentication').enabled,
          services: registeredServices,
        });
      });
    },
  ),
);

if (app.get('database') === 'mongodb') {
  app.configure(mongodb);
}

// Configure other middleware (see `middleware/index.ts`)
app.configure(middleware);
if (app.get('authentication').enabled) {
  app.configure(authentication);
  app.configure(casl());
}

// Set up our services (see `services/index.ts`)
app.configure(services);

// Set up event channels (see channels.ts)
app.configure(channels);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

export default app;
