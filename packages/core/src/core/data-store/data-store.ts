import authentication, { AuthenticationClient } from '@feathersjs/authentication-client';
import { feathers, type Application } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import { BehaviorSubject } from 'rxjs';
import io from 'socket.io-client';
import { MemoryService } from '@feathersjs/memory';
import localStorageService from './feathers-localstorage';
import { addObjectId, renameIdField, createDate, updateDate, findDistinct } from './hooks';
import { logger } from '../logger';
import Login from './Login.svelte';
import { throwError } from '../../utils/error-handling';
import { noop } from '../../utils/misc';
import { iterableFromService } from './service-iterable';
import type { ObjectId, Service, User } from '../types';
import { mount, unmount } from 'svelte';

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

export class DataStore {
  feathers: Application & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    io: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rest?: any;
    authentication: AuthenticationClient;
    authenticate: AuthenticationClient['authenticate'];
    reAuthenticate: AuthenticationClient['reAuthenticate'];
    logout: AuthenticationClient['logout'];
  };
  requiresAuth = false;
  user: User;

  backend: DataStoreBackend;
  location: string;
  apiPrefix = '';

  $services = new BehaviorSubject([]);
  $status = new BehaviorSubject<'init' | 'connecting' | 'connected'>('init');

  #initPromise: Promise<void>;
  #connectPromise: Promise<void>;
  #authenticationPromise = Promise.resolve();
  #authenticating = false;
  #createService: (name: string) => void = noop;

  constructor(location = 'memory') {
    this.feathers = feathers();
    this.location = location;
    if (isValidUrl(location)) {
      this.backend = DataStoreBackend.Remote;
      const locUrl = new URL(location);
      const host = locUrl.host;
      this.apiPrefix = locUrl.pathname.replace(/\/$/, '');
      const socket = io(host, {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        path: this.apiPrefix + '/socket.io',
      });
      this.feathers.configure(socketio(socket, { timeout: 15000 }));
      this.#initPromise = new Promise((resolve) => {
        this.feathers.io.on('init', ({ auth }: { auth: boolean }) => {
          this.requiresAuth = auth;
          if (auth) {
            this.feathers.configure(
              authentication(),
              //{ path: `${this.apiPrefix}/authentication` }
            );
          }
          resolve();
        });
      });

      this.#connectPromise = new Promise<void>((resolve, reject) => {
        this.feathers.io.on('connect', () => {
          logger.log(`Connected to backend ${this.location}!`);
          resolve();
        });
        this.feathers.io.on('disconnect', (reason: string, details: unknown) => {
          logger.log(`Disconnected from backend ${this.location}! Reason: "${reason}"`);
          console.log('Details', details);
        });
        this.feathers.io.on('connect_error', (e: Error) => {
          logger.log(`Socket.io error: ${e.name}: ${e.message}`);
        });
        this.feathers.io.on('reconnect_failed', () => {
          const e =
            new Error(`Cannot reach backend at location ${this.location}. Is the server running?
          If using locally, run 'npm run backend'`);
          e.name = 'DataStore connection error';
          reject();
          throwError(e, { duration: 0 });
        });
      });
      logger.log(`Connecting to backend ${this.location}`);
    } else if (location === 'localStorage') {
      this.backend = DataStoreBackend.LocalStorage;
      const storageService = (name: string) =>
        localStorageService({
          storage: window.localStorage,
          name,
          id: '_id',
          multi: true,
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
          new MemoryService({
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
    if (this.$status.getValue() === 'connected') return this.user;
    if (this.backend !== DataStoreBackend.Remote) {
      this.$status.next('connected');
      this.user = { email: null, role: 'anonymous' };
      return this.user;
    }
    await this.#initPromise;
    await this.#connectPromise;
    return this.authenticate();
  }

  async authenticate(): Promise<User> {
    if (this.$status.getValue() === 'connected') return this.user;

    if (!this.requiresAuth) {
      this.user = { email: null, role: 'anonymous' };
      this.$status.next('connected');
      return this.user;
    }

    if (this.user) {
      this.$status.next('connected');
      return this.user;
    }

    if (this.$status.getValue() !== 'connecting') {
      this.$status.next('connecting');
    }

    const doAuth = () => {
      this.#authenticating = true;
      return new Promise<void>((resolve, reject) => {
        this.feathers
          .reAuthenticate()
          .catch(() => {
            return this.feathers.authenticate({ strategy: 'anonymous' });
          })
          .then(({ user }) => {
            this.#authenticating = false;
            this.user = user;
            if (user.role === 'anonymous') {
              logger.log(`Accessing DataStore Anonymously.`);
            } else {
              logger.log(`Authenticated as ${user.email}.`);
            }
            resolve();
          })
          .catch((err) => {
            this.#authenticating = false;
            reject(err);
          });
      });
    };

    this.#authenticationPromise = this.#authenticationPromise.then(() =>
      this.#authenticating ? null : doAuth(),
    );

    return this.#authenticationPromise.then(() => {
      this.$status.next('connected');
      return this.user;
    });
  }

  async login(email: string, password: string): Promise<User> {
    this.$status.next('connecting');
    const res = await this.feathers.authenticate({ strategy: 'local', email, password });
    this.user = res.user;
    this.$status.next('connected');
    return this.user;
  }

  async loginWithUI(): Promise<User> {
    this.$status.next('connecting');
    return new Promise<User>((resolve, reject) => {
      const app = mount(Login, {
        target: document.body,
        props: {
          dataStore: this,
          onterminate: (u: User) => {
            unmount(app);
            if (u) {
              this.$status.next('connected');
              resolve(u);
            } else {
              reject();
            }
          },
        },
      });
    });
  }

  async signup(options: {
    email: string;
    password: string;
    [key: string]: unknown;
  }): Promise<User> {
    try {
      this.$status.next('connecting');
      await this.service('users').create(options);
      await this.login(options.email, options.password);
      this.$status.next('connected');
      return this.user;
    } catch (error) {
      logger.error('An error occurred during signup', error);
      throw error;
      // return { email: null, role: 'anonymous' };
    }
  }

  async logout(): Promise<void> {
    await this.feathers.logout();
    document.location.reload();
  }

  service<T>(name: string): Service<T> {
    const serviceExists = Object.keys(this.feathers.services).includes(name);
    if (!serviceExists) {
      this.#createService(name);
      this.$services.next(Object.keys(this.feathers.services));
    }
    // const s =
    //   this.backend === DataStoreBackend.Remote
    //     ? this.feathers.service(`${this.apiPrefix}/${name}`)
    //     : this.feathers.service(name);
    const s: Service<T> = this.feathers.service(name) as Service<T>;
    if (!serviceExists) {
      s.items = () => iterableFromService(s);
    }
    return s;
  }

  async uploadAsset(
    blob: Blob,
    filename = '',
  ): Promise<{ _id: ObjectId; files: Record<string, ObjectId> }> {
    if (this.backend !== DataStoreBackend.Remote) {
      throwError(new Error('LocalStorage Backend does not yet support upload'));
    }

    try {
      const ext = blob.type.split(';')[0].split('/')[1];
      const name = filename || `asset.${ext}`;
      const fd = new FormData();
      fd.append(name, blob);

      const fetchOptions: RequestInit = { method: 'POST', body: fd };
      if (this.requiresAuth) {
        const jwt = await this.feathers.authentication.getAccessToken();
        const headers = new Headers({ Authorization: `Bearer ${jwt}` });
        fetchOptions.headers = headers;
      }
      const res = await fetch(`${this.location}/assets`, fetchOptions);
      const resData = await res.json();

      if (res.status !== 201) {
        const e = new Error(resData.message);
        e.name = resData.name;
        throw e;
      }

      return resData;
    } catch (error) {
      throwError(error as Error);
    }
  }

  setupAppHooks(): void {
    const beforeCreate = this.backend !== DataStoreBackend.Remote ? [addObjectId] : [];
    const findDistinctHook = this.backend !== DataStoreBackend.Remote ? [findDistinct] : [];
    this.feathers.hooks({
      before: {
        find: [...findDistinctHook, renameIdField],
        create: [...beforeCreate, createDate],
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
