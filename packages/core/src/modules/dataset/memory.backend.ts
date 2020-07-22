import feathers from '@feathersjs/feathers';
import memoryService from 'feathers-memory';
import sift from 'sift';
import { BaseBackend } from './base.backend';

export class MemoryBackend extends BaseBackend {
  constructor(name: string) {
    super();
    const app = feathers();
    app.use(
      `/${name}`,
      memoryService({
        // id: '_id',
        matcher: sift,
        paginate: {
          default: 100,
          max: 200,
        },
      }),
    );
    this.instances = app.service(name);
    this.setupHooks();
  }
}
