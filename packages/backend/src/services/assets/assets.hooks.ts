import { ObjectId } from 'mongodb';
import { Application, HookContext, NextFunction } from '../../declarations';
import { logger } from '../../logger';
import { HookMap } from '@feathersjs/feathers';
import { AssetsService } from './assets.class';
import {
  authAfterHooks,
  authReadHooks,
  authWriteHooks,
} from '../../authentication/permission-hooks';
import { iff, setNow } from 'feathers-hooks-common';

const isExternal = (context: HookContext) => context.params.provider !== 'internal';

export default (app: Application, requireAuth: boolean): HookMap<Application, AssetsService> => ({
  around: {
    all: [],
    remove: [
      async (context: HookContext, next: NextFunction) => {
        await next();
        const { files } = context.result as { files: Record<string, ObjectId> };
        const bucket = app.get('mongodbBucket');
        for (const [name, id] of Object.entries(files)) {
          logger.debug(`Deleting asset ${context.id}:${name} (id=${id})`);
          await bucket.delete(id);
        }
      },
    ],
  },
  before: {
    all: [],
    find: [iff(isExternal, ...authReadHooks(requireAuth))],
    get: [iff(isExternal, ...authReadHooks(requireAuth))],
    create: [...authWriteHooks(requireAuth), setNow('createdAt', 'updatedAt')],
    remove: [...authWriteHooks(requireAuth)],
  },
  after: {
    all: [iff(isExternal, ...authAfterHooks(requireAuth))],
  },
  error: {
    all: [],
  },
});
