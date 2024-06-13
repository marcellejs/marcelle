import authentication from '@feathersjs/authentication-client';
import { feathers, Application } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import io from 'socket.io-client';
import { MemoryService } from '@feathersjs/memory';
import localStorageService from './feathers-localstorage';
import { addObjectId, renameIdField, createDate, updateDate, findDistinct } from './hooks';
import { logger } from '../logger';
import Login from './Login.svelte';
import { throwError } from '../../utils/error-handling';
import { Stream } from '../stream';
import { noop } from '../../utils/misc';
import { iterableFromService } from './service-iterable';
import type { Service, User } from '../types';

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
  feathers: Application;
  requiresAuth = false;
  user: User;

  backend: DataStoreBackend;
  location: string;
  apiPrefix = '';

  $services = new Stream<string[]>([], true);

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
    if (this.backend !== DataStoreBackend.Remote) {
      return { email: null };
    }
    await this.#initPromise;
    await this.#connectPromise;
    return this.authenticate();
  }

  async authenticate(): Promise<User> {
    if (!this.requiresAuth) {
      this.user = { email: null };
      return this.user;
    }

    if (this.user) {
      return this.user;
    }

    const doAuth = () => {
      this.#authenticating = true;
      return new Promise<void>((resolve, reject) => {
        this.feathers
          .reAuthenticate()
          .then(({ user }) => {
            this.#authenticating = false;
            this.user = user;
            logger.log(`Authenticated as ${user.email}`);
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

    return this.#authenticationPromise.then(() => this.user);
  }

  async login(email: string, password: string): Promise<User> {
    const res = await this.feathers.authenticate({ strategy: 'local', email, password });
    this.user = res.user;
    return this.user;
  }

  async loginWithUI(): Promise<User> {
    const app = new Login({
      target: document.body,
      props: { dataStore: this },
    });
    return new Promise<User>((resolve, reject) => {
      app.$on('terminate', (e: CustomEvent<User>) => {
        app.$destroy();
        if (e.detail) {
          resolve(e.detail);
        } else {
          reject();
        }
      });
    });
  }

  async signup(email: string, password: string): Promise<User> {
    try {
      await this.service('users').create({ email, password });
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

  service<T>(name: string): Service<T> {
    const serviceExists = Object.keys(this.feathers.services).includes(name);
    if (!serviceExists) {
      this.#createService(name);
      this.$services.set(Object.keys(this.feathers.services));
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

  async uploadAsset(blob: Blob, filename = ''): Promise<string> {
    if (this.backend !== DataStoreBackend.Remote) {
      throwError(new Error('LocalStorage Backend does not yet support upload'));
    }
    // try {
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
    const res = await fetch(`${this.location}/assets/upload`, fetchOptions);

    const resData = await res.json();
    // TODO: Create asset document so that it can be removed
    // this.service('assets').create({url: resData.blob})
    const filePath = `/assets/${resData.blob}`;

    return filePath;
    // } catch (err) {
    //   console.error(err);
    // }
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
