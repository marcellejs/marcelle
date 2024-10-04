import type { Application, HookContext } from '../../declarations';
import type { HookMap } from '@feathersjs/feathers';
import type { MlModelsService } from './ml-models.class';
import { ObjectId, type GridFSBucket } from 'mongodb';
import { hooks as schemaHooks } from '@feathersjs/schema';
import { iff, setNow } from 'feathers-hooks-common';
import {
  authAfterHooks,
  authReadHooks,
  authWriteHooks,
} from '../../authentication/permission-hooks';
import {
  mlModelsDataValidator,
  mlModelsPatchValidator,
  mlModelsQueryValidator,
  mlModelsResolver,
  mlModelsExternalResolver,
  mlModelsDataResolver,
  mlModelsPatchResolver,
  mlModelsQueryResolver,
} from './ml-models.schema';

export async function deleteModelFiles(context: HookContext) {
  if (context.id !== undefined) {
    const existing = await context.service.get(context.id);
    const bucket = context.app.get('mongodbBucket') as GridFSBucket;
    for (const x of existing.files) {
      await bucket.delete(new ObjectId(x[1]));
    }
  } else {
    // eslint-disable-next-line no-console
    console.log('WARNING: MULTI MODE NOT FULLY IMPLEMENTED, FILES ARE NOT BEING DELETED');
  }
}

export default (requireAuth: boolean): HookMap<Application, MlModelsService> => ({
  around: {
    all: [
      schemaHooks.resolveExternal(mlModelsExternalResolver),
      schemaHooks.resolveResult(mlModelsResolver),
    ],
  },
  before: {
    all: [
      schemaHooks.validateQuery(mlModelsQueryValidator),
      schemaHooks.resolveQuery(mlModelsQueryResolver),
    ],
    find: [...authReadHooks(requireAuth)],
    get: [...authReadHooks(requireAuth)],
    create: [
      ...authWriteHooks(requireAuth),
      schemaHooks.validateData(mlModelsDataValidator),
      schemaHooks.resolveData(mlModelsDataResolver),
      setNow('createdAt', 'updatedAt'),
    ],
    patch: [
      ...authWriteHooks(requireAuth),
      schemaHooks.validateData(mlModelsPatchValidator),
      schemaHooks.resolveData(mlModelsPatchResolver),
      iff((context) => context.data?.files, deleteModelFiles),
      setNow('updatedAt'),
    ],
    update: [
      ...authWriteHooks(requireAuth),
      schemaHooks.validateData(mlModelsPatchValidator),
      schemaHooks.resolveData(mlModelsPatchResolver),
      deleteModelFiles,
      setNow('updatedAt'),
    ],
    remove: [...authWriteHooks(requireAuth), deleteModelFiles],
  },
  after: {
    all: [...authAfterHooks(requireAuth)],
  },
  error: {
    all: [],
  },
});
