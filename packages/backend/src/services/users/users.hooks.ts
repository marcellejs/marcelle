import { HookContext } from '@feathersjs/feathers';
import { authorize } from 'feathers-casl';
import { defineAbilitiesFor } from '../../authentication/authentication.abilities';
import { Application } from '../../declarations';
import { authenticate } from '@feathersjs/authentication';
import { hooks as schemaHooks } from '@feathersjs/schema';
import {
  userDataValidator,
  userPatchValidator,
  userQueryValidator,
  userResolver,
  userExternalResolver,
  userDataResolver,
  userPatchResolver,
  userQueryResolver,
} from './users.schema';
import { logger } from '../../logger';
// Don't remove this comment. It's needed to format import lines nicely.

const authorizeHook = authorize({ adapter: '@feathersjs/mongodb' });

export async function setRole(context: HookContext): Promise<HookContext> {
  const { type, data, service } = context;
  if (type !== 'before') {
    throw new Error('The "setRole" hook should only be used as a "before" hook.');
  }

  // const { type, data } = context;
  // const role = 'Editor';

  const { total } = await service.find({ query: { $limit: 0 } });
  // Set first user to Admin
  const role = total > 0 ? 'Editor' : 'Admin';

  const addRole = (d: Record<string, unknown>) => {
    if (!d) {
      return { role };
    }
    return { ...d, role };
  };

  context.data = Array.isArray(data) ? Promise.all(data.map(addRole)) : addRole(data);

  return context;
}

export function authenticateIfNecessary(context: HookContext): Promise<HookContext> {
  if (!context.app.get('authentication').allowSignup) {
    return authenticate('jwt')(context).then((c) => authorizeHook(c));
  }
  return Promise.resolve(context);
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(userExternalResolver),
      schemaHooks.resolveResult(userResolver),
    ],
    find: [authenticate('jwt')],
    get: [authenticate('jwt')],
    create: [],
    update: [authenticate('jwt')],
    patch: [authenticate('jwt')],
    remove: [authenticate('jwt')],
  },
  before: {
    all: [
      schemaHooks.validateQuery(userQueryValidator),
      schemaHooks.resolveQuery(userQueryResolver),
    ],
    find: [authorizeHook],
    get: [
      //authorizeHook
    ],
    create: [
      authenticateIfNecessary,
      schemaHooks.validateData(userDataValidator),
      schemaHooks.resolveData(userDataResolver),
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
    update: [authenticate('jwt'), authorizeHook],
    patch: [
      authenticate('jwt'),
      authorizeHook,
      schemaHooks.validateData(userPatchValidator),
      schemaHooks.resolveData(userPatchResolver),
    ],
    remove: [authenticate('jwt'), authorizeHook],
  },

  after: {
    all: [],
    create: [
      (context: HookContext): HookContext => {
        const user = context.data;
        logger.debug(`created user ${user.id} with role '${user.role}'`);
        return context;
      },
    ],
  },
  error: {
    all: [],
  },
};
