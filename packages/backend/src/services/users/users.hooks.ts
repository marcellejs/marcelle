import { HookContext } from '@feathersjs/feathers';
import { authorize } from 'feathers-casl';
import { defineAbilitiesFor } from '../../authentication/authentication.abilities';
import { Application } from '../../declarations';
import { authenticate } from '@feathersjs/authentication';
import { hooks as schemaHooks } from '@feathersjs/schema';
import { addVerification, removeVerification } from 'feathers-authentication-management';
import authNotifier from '../auth-management/notifier';
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
import { disallow, iff, isProvider, preventChanges } from 'feathers-hooks-common';
// Don't remove this comment. It's needed to format import lines nicely.

const sendVerify = () => {
  return async (context: HookContext<Application>) => {
    const notifier = authNotifier(context.app);
    const users = Array.isArray(context.result) ? context.result : [context.result];
    await Promise.all(users.map(async (user) => notifier('resendVerifySignup', user)));
  };
};

const authorizeHook = authorize({
  adapter: '@feathersjs/mongodb',
  availableFields: ['email', 'role'],
});

export async function setRole(
  context: HookContext<Application>,
): Promise<HookContext<Application>> {
  const { type, data, service } = context;
  if (type !== 'before') {
    throw new Error('The "setRole" hook should only be used as a "before" hook.');
  }

  const { total } = await service.find({ query: { $limit: 0 } });
  // Set first user to Admin
  const role = total > 0 ? 'editor' : 'admin';

  const addRole = (d: Record<string, unknown>) => {
    if (!d) {
      return { role };
    }
    return { ...d, role };
  };

  context.data = Array.isArray(data) ? Promise.all(data.map(addRole)) : addRole(data);

  return context;
}

export function authenticateIfNecessary(
  context: HookContext<Application>,
): Promise<HookContext<Application>> {
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
      iff(
        (context: HookContext<Application>) =>
          context.app.get('authentication')['email-validation']?.enabled &&
          context.app.get('authentication')['email-validation']?.validateEmail,
        addVerification('auth-management'),
      ),
    ],
    update: [
      authenticate('jwt'),
      authorizeHook,
      disallow('external'),
      schemaHooks.validateData(userDataValidator),
      schemaHooks.resolveData(userDataResolver),
    ],
    patch: [
      authenticate('jwt'),
      authorizeHook,
      iff(
        isProvider('external'),
        preventChanges(
          true,
          'email',
          'isVerified',
          'resetExpires',
          'resetShortToken',
          'resetToken',
          'verifyChanges',
          'verifyExpires',
          'verifyShortToken',
          'verifyToken',
        ),
      ),
      schemaHooks.validateData(userPatchValidator),
      schemaHooks.resolveData(userPatchResolver),
    ],
    remove: [authenticate('jwt'), authorizeHook],
  },

  after: {
    all: [],
    create: [
      (context: HookContext<Application>): HookContext<Application> => {
        const user = context.data;
        if (!user) return context;
        const ability = defineAbilitiesFor(user, context.app as Application);
        context.params.ability = ability;
        context.params.rules = ability.rules;
        return context;
      },
      iff(
        (context: HookContext<Application>) =>
          context.app.get('authentication')['email-validation']?.enabled &&
          context.app.get('authentication')['email-validation']?.validateEmail,
        sendVerify(),
        removeVerification(),
      ),
      (context: HookContext<Application>): HookContext<Application> => {
        const user = context.data;
        logger.debug(`created user ${user.id} with role '${user.role}'`);
        return context;
      },
    ],
  },
  error: {
    all: [],
    create: [
      (context: HookContext<Application>): HookContext<Application> => {
        const { data } = context.error;
        if (data?.code === 11000) {
          context.error.code = 409;
          context.error.name = 'Conflict';
          context.error.message = `A user with this ${Object.keys(data?.keyValue)[0]} already exists.`;
        }
        return context;
      },
    ],
  },
};
