import io from 'socket.io-client';
import feathers, { Service } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import memoryService from 'feathers-memory';
import localStorageService from 'feathers-localstorage';
import sift from 'sift';
import { addObjectId, renameIdField, createDate, updateDate } from './hooks';

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

export interface BackendOptions {
  location?: string;
}

export class Backend {
  readonly isBackend = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  #app: feathers.Application<any>;

  backendType: BackendType;

  createService: (name: string) => void = () => {};

  constructor({ location = 'memory' }: BackendOptions = {}) {
    this.#app = feathers();
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
