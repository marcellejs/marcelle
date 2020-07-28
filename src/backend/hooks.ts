import { HookContext } from '@feathersjs/feathers';
import genId from './objectid';

export function addObjectId(context: HookContext): HookContext {
  const { data, service } = context;

  context.data = {
    [service.id]: genId(),
    ...data,
  };

  return context;
}

export function renameIdField(context: HookContext): HookContext {
  const { result } = context;
  if (!result) return context;

  // eslint-disable-next-line no-underscore-dangle
  if (result._id) {
    // eslint-disable-next-line no-underscore-dangle
    result.id = result._id;
    // eslint-disable-next-line no-underscore-dangle
    delete result._id;
  } else if (result.total && Array.isArray(result.data)) {
    (result.data as [{ _id?: string }]).forEach((x, i) => {
      // eslint-disable-next-line no-underscore-dangle
      if (x._id) {
        // eslint-disable-next-line no-underscore-dangle
        result.data[i].id = result.data[i]._id;
        // eslint-disable-next-line no-underscore-dangle
        delete result.data[i]._id;
      }
    });
  }

  return context;
}

export function createDate(context: HookContext): HookContext {
  if (!context.data) {
    context.data = {};
  }
  context.data.createdAt = new Date();
  context.data.updatedAt = context.data.createdAt;
  return context;
}

export function updateDate(context: HookContext): HookContext {
  if (!context.data || !context.data.createdAt) {
    return context;
  }
  context.data.updatedAt = new Date();
  return context;
}
