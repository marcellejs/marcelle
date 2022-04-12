import { HookContext, HooksObject, Paginated } from '@feathersjs/feathers';
import { setNow } from 'feathers-hooks-common';
import { authCreateHooks, authHooks } from '../../utils/permission-hooks';
// Don't remove this comment. It's needed to format import lines nicely.

const findDistinctNedb = async (context: HookContext) => {
  if (!context.params?.query?.$distinct || context.type !== 'before' || context.method !== 'find') {
    return context;
  }
  const { $distinct, ...query } = context.params.query;

  query.$select = [$distinct];
  query.$limit = 0;
  const { total } = (await await context.service.find({ ...context.params, query })) as Paginated<
    Record<string, unknown>
  >;
  query.$limit = total;
  const { data } = (await context.service.find({ ...context.params, query })) as Paginated<
    Record<string, unknown>
  >;
  const res = Array.from(new Set(data.map((item) => item[$distinct])));
  context.result = res;

  return context;
};

const findDistinctMongodb = async (context: HookContext) => {
  if (!context.params?.query?.$distinct || context.type !== 'before' || context.method !== 'find') {
    return context;
  }
  const { $distinct, ...query } = context.params.query;

  try {
    const res = await context.service.Model.distinct($distinct, query);
    context.result = res;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('An error occurred while calling distinct:', error);
    context.result = [];
  }

  return context;
};

const findDistinct = (db: string) => {
  if (db === 'nedb') {
    return findDistinctNedb;
  } else if (db === 'mongodb') {
    return findDistinctMongodb;
  } else {
    throw new Error('Invalid database type: only "nedb" or "mongodb" are currently supported');
  }
};

export default (dbType: string, requireAuth: boolean): HooksObject => {
  return {
    before: {
      all: authHooks(requireAuth),
      find: [findDistinct(dbType)],
      get: [],
      create: [...authCreateHooks(requireAuth), setNow('createdAt', 'updatedAt')],
      update: [...authCreateHooks(requireAuth), setNow('updatedAt')],
      patch: [...authCreateHooks(requireAuth), setNow('updatedAt')],
      remove: [],
    },

    after: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },

    error: {
      all: [],
      find: [],
      get: [],
      create: [],
      update: [],
      patch: [],
      remove: [],
    },
  };
};
