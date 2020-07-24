import feathers from '@feathersjs/feathers';
import memoryService from 'feathers-memory';
import sift from 'sift';
import { BaseBackend } from './base.backend';

export class MemoryBackend extends BaseBackend {
  constructor(name: string) {
    super(name);
    const app = feathers();
    app.use(
      '/instances',
      memoryService({
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
    this.setupHooks();
  }
}
