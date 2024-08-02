// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers';
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
import { mongodb } from './mongodb';
import { authentication } from './authentication';
import { services } from './services/index';
import { channels } from './channels';
import { getRegisteredServices } from './utils/registered-services';
import appHooks from './app.hooks';

const app = koa(feathers()) as any;

// Load our app configuration (see config/ folder)
app.configure(configuration());

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
      maxHttpBufferSize: 1e8,
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
  app.configure(authentication);
  app.configure(feathersCasl());
} else {
  console.log('Warning: This application does not have authentication enabled');
}
app.configure(services);

// Register hooks that run on all service methods
app.hooks(appHooks);
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: [],
});

export { app };
