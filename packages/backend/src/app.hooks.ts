// Application hooks that run for every service
// Don't remove this comment. It's needed to format import lines nicely.
import { HookContext } from '@feathersjs/feathers';
import { trace } from 'feathers-debugger-service';
import { ObjectId } from 'mongodb';

function normalizeMongoIds(context: HookContext): HookContext {
  if (
    context.app.get('database') !== 'mongodb' ||
    ['authentication', 'feathers-debugger'].includes(context.path) ||
    !context.params?.query ||
    context.type !== 'before'
  ) {
    return context;
  }

  const { query } = context.params;
  if (Object.keys(query).includes('_id')) {
    if (typeof query._id === 'string') {
      context.params.query._id = ObjectId(query._id);
    }
    if (typeof query._id === 'object' && query._id.$ne) {
      context.params.query._id.$ne = ObjectId(query._id.$ne);
    }
    if (typeof query._id === 'object' && query._id.$in) {
      context.params.query._id.$in = query._id.$in.map((x: string) => ObjectId(x));
    }
    if (typeof query._id === 'object' && query._id.$nin) {
      context.params.query._id.$nin = query._id.$nin.map((x: string) => ObjectId(x));
    }
  }

  return context;
}

function convertDateQueries(context: HookContext): HookContext {
  for (const op of ['$gt', '$gte', '$lt', '$lte']) {
    if (context.params?.query?.createdAt && context.params.query.createdAt[op]) {
      context.params.query.createdAt[op] = new Date(context.params.query.createdAt[op]);
    }
    if (context.params?.query?.updatedAt && context.params.query.updatedAt[op]) {
      context.params.query.updatedAt[op] = new Date(context.params.query.updatedAt[op]);
    }
  }
  return context;
}

export default {
  before: {
    all: [normalizeMongoIds, convertDateQueries, trace()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
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

  finally: {
    all: [trace()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
