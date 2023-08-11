import { HookContext, Paginated } from '@feathersjs/feathers';
import { setNow } from 'feathers-hooks-common';
import { Application } from '../../declarations';
import { authReadHooks, authWriteHooks } from '../../authentication/permission-hooks';
import { GenericService } from './generic.class';
// Don't remove this comment. It's needed to format import lines nicely.

const findDistinctNedb = async (context: HookContext<Application, GenericService>) => {
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

const findDistinctMongodb = async (context: HookContext<Application, GenericService>) => {
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

const findDistinct = (db: string) => {
  if (db === 'nedb') {
    return findDistinctNedb;
  } else if (db === 'mongodb') {
    return findDistinctMongodb;
  } else {
    throw new Error('Invalid database type: only "nedb" or "mongodb" are currently supported');
  }
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default (requireAuth: boolean, dbType: 'mongodb' | 'nedb' = 'mongodb') => ({
  around: {
    all: [],
  },
  before: {
    all: [],
    find: [...authReadHooks(requireAuth), findDistinct(dbType)],
    get: [...authReadHooks(requireAuth)],
    create: [...authWriteHooks(requireAuth), setNow('createdAt', 'updatedAt')],
    update: [...authWriteHooks(requireAuth), setNow('updatedAt')],
    patch: [...authWriteHooks(requireAuth), setNow('updatedAt')],
    remove: [...authWriteHooks(requireAuth)],
  },
  after: {
    all: [],
  },
  error: {
    all: [],
  },
});
