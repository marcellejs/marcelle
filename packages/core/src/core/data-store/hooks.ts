import type { HookContext, Paginated } from '@feathersjs/feathers';
import genId from './objectid';
import { convertURIToImageData } from '../../utils/image';

export function addObjectId(context: HookContext): HookContext {
  const { data, service } = context;

  context.data = {
    [service.id]: genId(),
    ...data,
  };

  return context;
}

export function renameIdField(context: HookContext): HookContext {
  const { result, params } = context;
  if (result) {
    if (result._id) {
      result.id = result._id;
      delete result._id;
    } else if (result.total && Array.isArray(result.data)) {
      for (const [i, x] of (result.data as [{ _id?: string }]).entries()) {
        if (x._id) {
          result.data[i].id = result.data[i]._id;
          delete result.data[i]._id;
        }
      }
    }
  } else if (params && params.query) {
    if (params.query.id) {
      context.params.query._id = context.params.query.id;
      delete context.params.query.id;
    }
    if (
      params.query.$select &&
      params.query.$select.includes('id') &&
      !params.query.$select.includes('_id')
    ) {
      context.params.query.$select.push('_id');
    }
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

export function addScope(key: string, value: string) {
  return (context: HookContext): HookContext => {
    const { data } = context;

    context.data = {
      [key]: value,
      ...data,
    };

    return context;
  };
}

export function limitToScope(key: string, value: string) {
  return (context: HookContext): HookContext => {
    context.params = context.params || {};
    context.params.query = context.params.query || {};
    context.params.query[key] = value;

    return context;
  };
}

const canvas1 = document.createElement('canvas');
const ctx1 = canvas1.getContext('2d');
export async function imageData2DataURL(context: HookContext): Promise<HookContext> {
  const { data } = context;

  for (const [key, val] of Object.entries(data)) {
    if (val instanceof ImageData) {
      const w = val.width;
      const h = val.height;
      canvas1.width = w;
      canvas1.height = h;
      ctx1.putImageData(val, 0, 0); // synchronous

      context.data[key] = canvas1.toDataURL('image/jpeg');
    }
  }

  return context;
}

export async function dataURL2ImageData(context: HookContext): Promise<HookContext> {
  if (!context.result) return context;
  const { result } = context;

  const hasImageData = (data: unknown) =>
    data && typeof data === 'string' && data.slice(0, 22) === 'data:image/jpeg;base64';

  if (result._id) {
    for (const [key, val] of Object.entries(result).filter(([k]) => k !== 'thumbnail')) {
      if (hasImageData(val)) {
        result[key] = await convertURIToImageData(val as string);
      }
    }
  } else if (result.total && Array.isArray(result.data)) {
    for (const [i, v] of result.data.entries()) {
      for (const [key, val] of Object.entries(v).filter(([k]) => k !== 'thumbnail')) {
        if (hasImageData(val)) {
          result.data[i][key] = await convertURIToImageData(val as string);
        }
      }
    }
  }

  return context;
}

export async function findDistinct(context: HookContext): Promise<HookContext> {
  if (!context.params?.query?.$distinct || context.type !== 'before' || context.method !== 'find') {
    return context;
  }
  const { $distinct, ...query } = context.params.query;

  query.$select = [$distinct];
  query.$skip = 0;
  let tot = 1;
  const distinct = new Set();
  while (query.$skip < tot) {
    const res = (await context.service.find({ query })) as Paginated<Record<string, unknown>>;
    for (const x of res.data) {
      distinct.add(x[$distinct]);
    }
    query.$skip += res.limit;
    tot = res.total;
  }
  context.result = Array.from(distinct);

  return context;
}
