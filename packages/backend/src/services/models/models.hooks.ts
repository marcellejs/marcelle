import path from 'path';
import { HookContext, HooksObject } from '@feathersjs/feathers';
import { iff, setNow } from 'feathers-hooks-common';
import rmdir from '../../utils/rmdir';
import { GridFSBucket, ObjectId } from 'mongodb';
import { authReadHooks, authWriteHooks } from '../../utils/permission-hooks';
// Don't remove this comment. It's needed to format import lines nicely.

const removeModelFilesFromDisk = (modelType: string) => async (context: HookContext) => {
  if (!context.id) {
    return context;
  }
  const { files } = await context.service.get(context.id, {
    ...context.params,
    query: { $select: ['files'] },
  });
  try {
    if (files.length > 0) {
      const modelId = files[0][1].split('/')[0];
      rmdir(path.join(context.app.get('uploads'), modelType, modelId));
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`An error ocurred while removing model files (Id: ${context.id}).`, error);
  }
  return context;
};

const removeModelFilesFromGridfs = async (context: HookContext) => {
  if (!context.id) {
    return context;
  }
  const bucket = context.app.get('mongoBucket') as GridFSBucket;
  const { files } = await context.service.get(context.id, {
    user: context.params?.user,
    query: { $select: ['files'] },
  });
  files.forEach((x: [string, string]) => {
    bucket.delete(new ObjectId(x[1]), (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log(`An error ocurred while removing model files (Id: ${context.id}).`, err);
      }
    });
  });

  return context;
};

const removeModelFiles = (modelType: string, useGridfs: boolean) =>
  useGridfs ? removeModelFilesFromGridfs : removeModelFilesFromDisk(modelType);

export default (requireAuth: boolean, modelType: string, useGridfs: boolean): HooksObject => {
  return {
    before: {
      all: [],
      find: [...authReadHooks(requireAuth)],
      get: [...authReadHooks(requireAuth)],
      create: [...authWriteHooks(requireAuth), setNow('createdAt', 'updatedAt')],
      update: [
        ...authWriteHooks(requireAuth),
        removeModelFiles(modelType, useGridfs),
        setNow('updatedAt'),
      ],
      patch: [
        ...authWriteHooks(requireAuth),
        iff((context) => context.data?.files, removeModelFiles(modelType, useGridfs)),
        setNow('updatedAt'),
      ],
      remove: [...authReadHooks(requireAuth), removeModelFiles(modelType, useGridfs)],
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
