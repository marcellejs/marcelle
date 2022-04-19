import path from 'path';
import { HookContext, HooksObject } from '@feathersjs/feathers';
import { iff, setNow } from 'feathers-hooks-common';
import rmdir from '../../utils/rmdir';
import { authReadHooks, authWriteHooks } from '../../utils/permission-hooks';
// Don't remove this comment. It's needed to format import lines nicely.

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
  return {
    before: {
      all: [],
      find: [...authReadHooks(requireAuth)],
      get: [...authReadHooks(requireAuth)],
      create: [...authWriteHooks(requireAuth), setNow('createdAt', 'updatedAt')],
      update: [...authWriteHooks(requireAuth), removeAssetFiles, setNow('updatedAt')],
      patch: [
        ...authWriteHooks(requireAuth),
        iff((context) => context.data?.files, removeAssetFiles),
        setNow('updatedAt'),
      ],
      remove: [...authReadHooks(requireAuth), removeAssetFiles],
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
