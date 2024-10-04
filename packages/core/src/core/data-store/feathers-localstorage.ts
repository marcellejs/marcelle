// Temporaty adaptation of https://github.com/feathersjs-ecosystem/feathers-localstorage
import { MemoryService, type MemoryServiceOptions } from '@feathersjs/memory';
import type { AdapterParams, PaginationOptions } from '@feathersjs/adapter-commons';
import type { Id, NullableId, Paginated } from '@feathersjs/feathers';

const usedKeys: string[] = [];

export interface LocalStorageServiceOptions extends MemoryServiceOptions {
  name?: string;
  storage?: Storage;
  throttle?: number;
  reuseKeys?: boolean;
}

export class LocalStorageService<
  Result = unknown,
  Data = Partial<Result>,
  ServiceParams extends AdapterParams = AdapterParams,
  PatchData = Partial<Data>,
> extends MemoryService<Result, Data, ServiceParams, PatchData> {
  _storageKey: string;
  _storage: Storage;
  _throttle: number;
  _reuseKeys: boolean;
  _timeout: NodeJS.Timeout;

  constructor(options: LocalStorageServiceOptions = {}) {
    super(options);
    this._storageKey = options.name || 'feathers';
    this._storage = options.storage || (typeof window !== 'undefined' && window.localStorage);
    this._throttle = options.throttle || 200;
    this._reuseKeys = options.reuseKeys || false;

    this.store = null;

    if (!this._storage) {
      throw new Error('The `storage` option needs to be provided');
    }

    if (usedKeys.indexOf(this._storageKey) === -1) {
      usedKeys.push(this._storageKey);
    } else {
      if (!this._reuseKeys) {
        throw new Error(
          `The storage name '${this._storageKey}' is already in use by another instance.`,
        );
      }
    }

    this.ready();
  }

  ready() {
    if (!this.store) {
      return Promise.resolve(this._storage.getItem(this._storageKey))
        .then((str) => JSON.parse(str || '{}'))
        .then((store) => {
          const keys = Object.keys(store);
          const last = store[keys[keys.length - 1]];

          // Current id is the id of the last item
          this._uId =
            keys.length && typeof last[this.id] !== 'undefined' ? last[this.id] + 1 : this._uId;

          this.store = store;
          return this.store;
        });
    }

    return Promise.resolve(this.store);
  }

  flush(data: Result): Result;
  flush(data: Result[]): Result[];
  flush(data: Result | Result[]): Result | Result[] {
    if (!this._timeout) {
      this._timeout = setTimeout(() => {
        this._storage.setItem(this._storageKey, JSON.stringify(this.store));
        delete this._timeout;
      }, this._throttle);
    }

    return data;
  }

  async find(params?: ServiceParams & { paginate?: PaginationOptions }): Promise<Paginated<Result>>;
  async find(params?: ServiceParams & { paginate: false }): Promise<Result[]>;
  async find(params?: ServiceParams): Promise<Paginated<Result> | Result[]>;
  async find(params?: ServiceParams): Promise<Paginated<Result> | Result[]> {
    return this.ready().then(() => super.find(params));
  }

  async get(id: Id, params?: ServiceParams): Promise<Result> {
    return this.ready().then(() => super.get(id, params));
  }

  async create(data: Data, params?: ServiceParams): Promise<Result>;
  async create(data: Data[], params?: ServiceParams): Promise<Result[]>;
  async create(data: Data | Data[], params?: ServiceParams): Promise<Result | Result[]> {
    return this.ready()
      .then(() => super.create(data as Data, params))
      .then((res) => this.flush(res));
  }

  async update(id: Id, data: Data, params?: ServiceParams): Promise<Result> {
    return this.ready()
      .then(() => super.update(id, data, params))
      .then((res) => this.flush(res));
  }

  async patch(id: Id, data: PatchData, params?: ServiceParams): Promise<Result>;
  async patch(id: null, data: PatchData, params?: ServiceParams): Promise<Result[]>;
  async patch(id: NullableId, data: PatchData, params?: ServiceParams): Promise<Result | Result[]> {
    return this.ready()
      .then(() => super.patch(id, data, params))
      .then((res) => this.flush(res));
  }

  async remove(id: Id, params?: ServiceParams): Promise<Result>;
  async remove(id: null, params?: ServiceParams): Promise<Result[]>;
  async remove(id: NullableId, params?: ServiceParams): Promise<Result | Result[]> {
    return this.ready()
      .then(() => super.remove(id, params))
      .then((res) => this.flush(res));
  }
}

export default (options: LocalStorageServiceOptions = {}) => {
  return new LocalStorageService(options);
};
