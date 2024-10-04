import { setNow } from 'feathers-hooks-common';
import {
  authAfterHooks,
  authReadHooks,
  authWriteHooks,
} from '../../authentication/permission-hooks';
import { GenericService } from './generic.class';
import { Application, HookContext } from '../../declarations';
import { HookMap } from '@feathersjs/feathers';
// Don't remove this comment. It's needed to format import lines nicely.

const findDistinct = async (context: HookContext<GenericService>) => {
  if (!context.params?.query?.$distinct || context.type !== 'before' || context.method !== 'find') {
    return context;
  }
  const { $distinct, ...query } = context.params.query;

  try {
    const model = await context.service.options.Model;
    context.result = await model.distinct($distinct, query);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('An error occurred while calling distinct:', error);
    context.result = [];
  }

  return context;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (requireAuth: boolean): HookMap<Application, GenericService> => ({
  around: {
    all: [],
  },
  before: {
    all: [],
    find: [...authReadHooks(requireAuth), findDistinct],
    get: [...authReadHooks(requireAuth)],
    create: [...authWriteHooks(requireAuth), setNow('createdAt', 'updatedAt')],
    update: [...authWriteHooks(requireAuth), setNow('updatedAt')],
    patch: [...authWriteHooks(requireAuth), setNow('updatedAt')],
    remove: [...authWriteHooks(requireAuth)],
  },
  after: {
    all: [...authAfterHooks(requireAuth)],
  },
  error: {
    all: [],
  },
});
