// Application hooks that run for every service
// Don't remove this comment. It's needed to format import lines nicely.
import { HookContext } from '@feathersjs/feathers';
import { ObjectId } from 'mongodb';
import { Application } from './declarations';
import { logError } from './hooks/log-error';

function normalizeMongoIds(context: HookContext<Application>): HookContext<Application> {
  if (
    // context.app.get('database') !== 'mongodb' ||
    ['authentication', 'feathers-debugger'].includes(context.path) ||
    !context.params?.query ||
    context.type !== 'before'
  ) {
    return context;
  }

  const { query } = context.params;
  if (Object.keys(query).includes('_id')) {
    if (typeof query._id === 'string') {
      context.params.query._id = new ObjectId(query._id as string);
    }
    if (typeof query._id === 'object' && query._id.$ne) {
      context.params.query._id.$ne = new ObjectId(query._id.$ne as string);
    }
    if (typeof query._id === 'object' && query._id.$in) {
      context.params.query._id.$in = query._id.$in.map((x: string) => new ObjectId(x));
    }
    if (typeof query._id === 'object' && query._id.$nin) {
      context.params.query._id.$nin = query._id.$nin.map((x: string) => new ObjectId(x));
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
  around: {
    all: [logError],
  },
  before: {
    all: [normalizeMongoIds, convertDateQueries],
  },
  after: {},
  error: {},
};
