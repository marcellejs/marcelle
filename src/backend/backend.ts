import io from 'socket.io-client';
import authentication from '@feathersjs/authentication-client';
import feathers, { Service } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import memoryService from 'feathers-memory';
import localStorageService from 'feathers-localstorage';
import sift from 'sift';
import { addObjectId, renameIdField, createDate, updateDate } from './hooks';
import { logger } from '../core/logger';
import Login from './Login.svelte';

function isValidUrl(str: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(str);
  } catch (_) {
    return false;
  }
  return true;
}

export enum BackendType {
  Memory,
  LocalStorage,
  Remote,
}

interface User {
  email: string;
}

export interface BackendOptions {
  location?: string;
  auth?: boolean;
}

export class Backend {
  readonly isBackend = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #app: feathers.Application<any>;

  requiresAuth = false;
  user: User;
  #authenticationPromise: Promise<void>;

  backendType: BackendType;

  createService: (name: string) => void = () => {};

  constructor({ location = 'memory', auth = false }: BackendOptions = {}) {
    this.#app = feathers();
    this.requiresAuth = auth && !['memory', 'localStorage'].includes(location);
    if (isValidUrl(location)) {
      this.backendType = BackendType.Remote;
      const socket = io(location);
      this.#app.configure(socketio(socket));
    } else if (location === 'localStorage') {
      this.backendType = BackendType.LocalStorage;
      const storageService = (name: string) =>
        localStorageService({
          storage: window.localStorage,
          matcher: sift,
          name,
          paginate: {
            default: 100,
            max: 200,
          },
        });
      this.createService = (name: string) => {
        this.#app.use(`/${name}`, storageService(name));
      };
    } else if (location === 'memory') {
      this.backendType = BackendType.Memory;
      this.createService = (name: string) => {
        this.#app.use(
          `/${name}`,
          memoryService({
            matcher: sift,
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
    if (auth) {
      this.#app.configure(authentication());
    }
  }

  async authenticate(): Promise<User> {
    if (!this.requiresAuth) return { email: null };
    if (!this.#authenticationPromise) {
      this.#authenticationPromise = new Promise((resolve, reject) => {
        this.#app
          .reAuthenticate()
          .then(({ user }) => {
            this.user = user;
            logger.log(`Authenticated as ${user.email}`);
            resolve();
          })
          .catch(() => {
            const app = new Login({
              target: document.querySelector('#app'),
              props: { backend: this },
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
    const res = await this.#app.authenticate({ strategy: 'local', email, password });
    this.user = res.user;
    return this.user;
  }

  async signup(email: string, password: string): Promise<User> {
    try {
      await this.#app.service('users').create({ email, password });
      await this.login(email, password);
      return this.user;
    } catch (error) {
      logger.error('An error occurred during signup', error);
      return { email: null };
    }
  }

  async logout(): Promise<void> {
    await this.#app.logout();
    document.location.reload();
  }

  service(name: string): Service<unknown> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.#app.service(name);
  }

  setupAppHooks(): void {
    const beforeCreate = this.backendType !== BackendType.Remote ? [addObjectId] : [];
    this.#app.hooks({
      before: {
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
