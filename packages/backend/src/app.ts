// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { FeathersService, ServiceInterface, ServiceOptions, feathers } from '@feathersjs/feathers';
import configuration from '@feathersjs/configuration';
import {
  koa,
  rest,
  bodyParser,
  errorHandler,
  parseAuthentication,
  cors,
  serveStatic,
} from '@feathersjs/koa';
import socketio from '@feathersjs/socketio';
import { feathersCasl } from 'feathers-casl';

import type { Application, ServiceTypes } from './declarations';
import { mongodb } from './mongodb';
import { authentication } from './authentication';
import { services } from './services/index';
import { channels } from './channels';
import { getRegisteredServices } from './utils/registered-services';
import appHooks from './app.hooks';

function createApp() {
  const a = koa(feathers()) as any;

  // Load our app configuration (see config/ folder)
  a.configure(configuration());

  let apiPrefix = ((a.get('apiPrefix') as string) || '')
    .split('/')
    .filter((x) => x !== '')
    .join('/');
  if (apiPrefix.length > 0) {
    apiPrefix += '/';
  }
  a.set('apiPrefix', apiPrefix);

  if (a.get('authentication').enabled) {
    a.get('authentication').service = apiPrefix + a.get('authentication').service;
  }

  a.getService = function <L extends keyof ServiceTypes>(
    location: L,
  ): FeathersService<Application, ServiceTypes[L]> {
    return a.service(apiPrefix + location);
  };

  a.getServicePath = function <L extends keyof ServiceTypes>(location: L): string {
    return apiPrefix + location;
  };

  a.declareService = function <L extends keyof ServiceTypes>(
    location: L,
    service: keyof any extends keyof ServiceTypes
      ? ServiceInterface | Application
      : ServiceTypes[L],
    options?: ServiceOptions<keyof any extends keyof ServiceTypes ? string : keyof ServiceTypes[L]>,
  ) {
    a.use(apiPrefix + location, service, options);

    return (a as Application).getService(location);
  };

  return a as Application;
}

const app = createApp();

// Set up Koa middleware
app.use(cors());
app.use(serveStatic(app.get('public')));
app.use(errorHandler());
app.use(parseAuthentication());
app.use(bodyParser({ multipart: false }));

// Configure services and transports
app.configure(rest());
app.configure(
  socketio(
    {
      cors: {
        origin: app.get('origins'),
      },
      path: '/' + app.get('apiPrefix') + 'socket.io',
    },
    (io) => {
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
app.configure(channels);
app.configure(mongodb);
if (app.get('authentication').enabled) {
  console.log('Configuring authentication');
  app.configure(authentication);
  app.configure(feathersCasl());
} else {
  console.log('Warning: This application does not require authentication');
}
console.log('Configuring services');
app.configure(services);

// Register hooks that run on all service methods
app.hooks(appHooks);
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: [],
});

export { app };
