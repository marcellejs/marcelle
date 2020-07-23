import feathers from '@feathersjs/feathers';
import localStorageService from 'feathers-localstorage';
import sift from 'sift';
import { BaseBackend } from './base.backend';

export class LocalStorageBackend extends BaseBackend {
  constructor(name: string) {
    super(name);
    const app = feathers();
    app.use(
      '/instances',
      localStorageService({
        storage: window.localStorage,
        // id: '_id',
        matcher: sift,
        paginate: {
          default: 100,
          max: 200,
        },
      }),
    );
    this.instances = app.service('instances');
    this.generateId = true;
    this.convertImageData = true;
    this.setupHooks();
  }
}
