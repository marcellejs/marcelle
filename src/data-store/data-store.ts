import io from 'socket.io-client';
import authentication from '@feathersjs/authentication-client';
import feathers, { Service } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import memoryService from 'feathers-memory';
import localStorageService from 'feathers-localstorage';
import { addObjectId, renameIdField, createDate, updateDate } from './hooks';
import { logger } from '../core/logger';
import Login from './Login.svelte';
import { throwError } from '../utils/error-handling';
import { Stream } from '../core/stream';
import { noop } from '../utils/misc';

function isValidUrl(str: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(str);
  } catch (_) {
    return false;
  }
  return true;
}

export enum DataStoreBackend {
  Memory,
  LocalStorage,
  Remote,
}

interface User {
  email: string;
}

export class DataStore {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  feathers: feathers.Application<any>;
  requiresAuth = false;
  user: User;

  backend: DataStoreBackend;
  location: string;

  $services: Stream<string[]> = new Stream([], true);

  #connectPromise: Promise<void>;
  #authenticationPromise: Promise<void>;
  #createService: (name: string) => void = noop;

  constructor(location = 'memory') {
    this.feathers = feathers();
    this.location = location;
    if (isValidUrl(location)) {
      this.backend = DataStoreBackend.Remote;
      const socket = io(location, {
        transports: ['websocket'],
        reconnectionAttempts: 3,
      });
      this.feathers.configure(socketio(socket, { timeout: 5000 }));
      this.feathers.io.on('init', ({ auth }: { auth: boolean }) => {
        this.requiresAuth = auth;
        if (auth) {
          this.feathers.configure(authentication());
        }
      });
    } else if (location === 'localStorage') {
      this.backend = DataStoreBackend.LocalStorage;
      const storageService = (name: string) =>
        localStorageService({
          storage: window.localStorage,
          name,
          id: '_id',
          paginate: {
            default: 100,
            max: 200,
          },
        });
      this.#createService = (name: string) => {
        this.feathers.use(`/${name}`, storageService(name));
      };
    } else if (location === 'memory') {
      this.backend = DataStoreBackend.Memory;
      this.#createService = (name: string) => {
        this.feathers.use(
          `/${name}`,
          memoryService({
            id: '_id',
            paginate: {
              default: 100,
              max: 200,
            },
          }),
        );
      };
    } else {
      throw new Error(`Cannot process backend location '${location}'`);
    }
    this.setupAppHooks();
  }

  async connect(): Promise<User> {
    if (this.backend !== DataStoreBackend.Remote) {
      return { email: null };
    }
    if (!this.#connectPromise) {
      logger.log(`Connecting to backend ${this.location}...`);
      this.#connectPromise = new Promise<void>((resolve, reject) => {
        this.feathers.io.on('connect', () => {
          logger.log(`Connected to backend ${this.location}!`);
          resolve();
        });
        this.feathers.io.on('reconnect_failed', () => {
          const e = new Error(`Cannot reach backend at location ${this.location}. Is the server running?
          If using locally, run 'npm run backend'`);
          e.name = 'DataStore connection error';
          reject();
          throwError(e, { duration: 0 });
        });
      });
    }
    await this.#connectPromise;
    if (this.requiresAuth) {
      await this.authenticate();
    }
    return this.requiresAuth ? this.user : { email: null };
  }

  async authenticate(): Promise<User> {
    if (!this.requiresAuth) return { email: null };
    if (!this.#authenticationPromise) {
      this.#authenticationPromise = new Promise<void>((resolve, reject) => {
        this.feathers
          .reAuthenticate()
          .then(({ user }) => {
            this.user = user;
            logger.log(`Authenticated as ${user.email}`);
            resolve();
          })
          .catch(() => {
            const app = new Login({
              target: document.querySelector('#app'),
              props: { dataStore: this },
            });
            app.$on('terminate', (success) => {
              app.$destroy();
              if (success) {
                resolve();
              } else {
                reject();
              }
            });
          });
      });
    }
    await this.#authenticationPromise;
    return this.user;
  }

  async login(email: string, password: string): Promise<User> {
    const res = await this.feathers.authenticate({ strategy: 'local', email, password });
    this.user = res.user;
    return this.user;
  }

  async signup(email: string, password: string): Promise<User> {
    try {
      await this.feathers.service('users').create({ email, password });
      await this.login(email, password);
      return this.user;
    } catch (error) {
      logger.error('An error occurred during signup', error);
      return { email: null };
    }
  }

  async logout(): Promise<void> {
    await this.feathers.logout();
    document.location.reload();
  }

  service(name: string): Service<unknown> {
    if (!Object.keys(this.feathers.services).includes(name)) {
      this.#createService(name);
      this.$services.set(Object.keys(this.feathers.services));
    }
    return this.feathers.service(name);
  }

  setupAppHooks(): void {
    const beforeCreate = this.backend !== DataStoreBackend.Remote ? [addObjectId] : [];
    this.feathers.hooks({
      before: {
        find: [renameIdField],
        create: beforeCreate.concat([createDate]),
        update: [updateDate],
        patch: [updateDate],
      },
      after: {
        find: [renameIdField],
        get: [renameIdField],
        create: [renameIdField],
        update: [renameIdField],
        patch: [renameIdField],
        remove: [renameIdField],
      },
    });
  }
}
