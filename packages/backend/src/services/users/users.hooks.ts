import * as feathersAuthentication from '@feathersjs/authentication';
import * as local from '@feathersjs/authentication-local';
import { HookContext } from '@feathersjs/feathers';
import { authorize } from 'feathers-casl/dist/hooks';
import { defineAbilitiesFor } from '../../authentication/abilities';
import { Application } from '../../declarations';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;

async function setRole(context: HookContext): Promise<HookContext> {
  const { type, data } = context;
  // const { type, data, service } = context;
  // const { total } = await service.find({ query: { $limit: 0 } });
  // const role = total > 0 ? 'Editor' : 'Admin';
  const role = 'editor';

  if (type !== 'before') {
    throw new Error('The "setField" hook should only be used as a "before" hook.');
  }

  const addRole = (d: Record<string, unknown>) => {
    if (!d) {
      return { role };
    }
    return { ...d, role };
  };

  context.data = Array.isArray(data) ? Promise.all(data.map(addRole)) : addRole(data);

  return context;
}

function authenticateIfNecessary(context: HookContext): Promise<HookContext> {
  if (!context.app.get('authentication').allowSignup) {
    return authenticate('jwt')(context).then((c) => authorize({ adapter: 'feathers-mongodb' })(c));
  }
  return Promise.resolve(context);
}

export default {
  before: {
    all: [],
    find: [authenticate('jwt'), authorize({ adapter: 'feathers-mongodb' })],
    get: [
      authenticate('jwt'),
      //authorize({ adapter: 'feathers-mongodb' })
    ],
    create: [
      authenticateIfNecessary,
      hashPassword('password'),
      setRole,
      (context: HookContext): HookContext => {
        const user = context.data;
        if (!user) return context;
        const ability = defineAbilitiesFor(user, context.app as Application);
        context.params.ability = ability;
        context.params.rules = ability.rules;
        return context;
      },
    ],
    update: [
      hashPassword('password'),
      authenticate('jwt'),
      (context: HookContext) => {
        const { user } = context.params;
        console.log('authWriteHooks [update]', user?._id, context.id);
      },
      authorize({ adapter: 'feathers-mongodb' }),
    ],
    patch: [
      hashPassword('password'),
      authenticate('jwt'),
      (context: HookContext) => {
        const { user } = context.params;
        console.log('authWriteHooks [patch]', user?._id, context.id);
      },
      authorize({ adapter: 'feathers-mongodb' }),
    ],
    remove: [authenticate('jwt'), authorize({ adapter: 'feathers-mongodb' })],
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password'),
      // authorize({ adapter: 'feathers-mongodb' }),
    ],
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
