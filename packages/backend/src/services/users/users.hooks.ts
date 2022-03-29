import * as feathersAuthentication from '@feathersjs/authentication';
import * as local from '@feathersjs/authentication-local';
import { Forbidden } from '@feathersjs/errors';
import { HookContext } from '@feathersjs/feathers';
import { iff } from 'feathers-hooks-common';
import checkPermissions from 'feathers-permissions';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = feathersAuthentication.hooks;
const { hashPassword, protect } = local.hooks;

async function setPermissions(context: HookContext): Promise<HookContext> {
  const { type, data, service } = context;
  const { total } = await service.find({ query: { $limit: 0 } });
  const permissions = total > 0 ? 'editor' : 'admin';

  if (type !== 'before') {
    throw new Error('The "setField" hook should only be used as a "before" hook.');
  }

  const addRole = (d: Record<string, unknown>) => {
    if (!d) {
      return { permissions };
    }
    return { ...d, permissions };
  };

  context.data = Array.isArray(data) ? Promise.all(data.map(addRole)) : addRole(data);

  return context;
}

async function removePermissions(context: HookContext): Promise<HookContext> {
  const { type, data } = context;

  if (type !== 'before') {
    throw new Error('The "setField" hook should only be used as a "before" hook.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { permissions, ...rest } = data || {};

  context.data = rest;

  return context;
}

const adminOrSelf = iff(
  (context) => context.params?.provider !== undefined && !!context.params?.user?._id,
  checkPermissions({ roles: ['admin'], error: false }),
  iff(
    (context) => `${context.id}` !== `${context.params?.user?._id}`,
    () => {
      throw new Forbidden('You do not have the correct permissions.');
    },
  ),
);

export default {
  before: {
    all: [],
    find: [authenticate('jwt'), checkPermissions({ roles: ['admin'] })],
    get: [authenticate('jwt'), adminOrSelf],
    create: [hashPassword('password'), setPermissions],
    update: [hashPassword('password'), removePermissions, authenticate('jwt'), adminOrSelf],
    patch: [hashPassword('password'), removePermissions, authenticate('jwt'), adminOrSelf],
    remove: [authenticate('jwt'), adminOrSelf],
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password'),
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
