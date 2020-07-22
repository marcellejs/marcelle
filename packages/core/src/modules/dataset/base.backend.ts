import { Service, HookContext } from '@feathersjs/feathers';
import { Instance } from './dataset.common';
import genId from './objectid';

const addObjectId = (context: HookContext) => {
  const { data, service } = context;

  context.data = {
    [service.id]: genId(),
    ...data,
  };

  return context;
};

export class BaseBackend {
  instances: Service<Instance>;

  setupHooks(): void {
    this.instances.hooks({
      before: {
        create: [addObjectId],
      },
    });
  }
}
