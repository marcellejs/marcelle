import path from 'path';
import * as authentication from '@feathersjs/authentication';
import { HookContext, HooksObject } from '@feathersjs/feathers';
import { setNow } from 'feathers-hooks-common';
import { setField } from 'feathers-authentication-hooks';
import rmdir from '../../utils/rmdir';
// Don't remove this comment. It's needed to format import lines nicely.

const { authenticate } = authentication.hooks;

const removeAssetFiles = async (context: HookContext) => {
  if (!context.id) {
    return context;
  }
  const { url } = await context.service.get(context.id, { query: { $select: ['url'] } });
  const base = url.split('/')[0];
  rmdir(path.join(context.app.get('uploads'), 'assets', base));
  return context;
};

export default (requireAuth: boolean): HooksObject => {
  const authHooks = requireAuth
    ? [authenticate('jwt'), setField({ from: 'params.user._id', as: 'params.query.userId' })]
    : [];
  const authCreateHooks = requireAuth
    ? [setField({ from: 'params.user._id', as: 'data.userId' })]
    : [];
  return {
    before: {
      all: [...authHooks],
      find: [],
      get: [],
      create: [...authCreateHooks, setNow('createdAt', 'updatedAt')],
      update: [removeAssetFiles, setNow('updatedAt')],
      patch: [removeAssetFiles, setNow('updatedAt')],
      remove: [removeAssetFiles],
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
