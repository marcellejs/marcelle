/* eslint-disable no-underscore-dangle */
import { HookContext } from '@feathersjs/feathers';
import genId from './objectid';
import { convertURIToImageData } from '../utils/image';

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

  const isImageData = data.data instanceof ImageData;
  if (isImageData) {
    const w = data.data.width;
    const h = data.data.height;
    canvas1.width = w;
    canvas1.height = h;
    ctx1.putImageData(data.data, 0, 0); // synchronous

    context.data.data = canvas1.toDataURL('image/jpeg');
  }

  return context;
}

export async function dataURL2ImageData(context: HookContext): Promise<HookContext> {
  if (!context.result) return context;
  const { result } = context;

  const hasImageData = (x: { data?: string }) =>
    x.data && typeof x.data === 'string' && x.data.slice(0, 22) === 'data:image/jpeg;base64';

  if (result._id && hasImageData(result)) {
    result.data = await convertURIToImageData(result.data);
  } else if (result.total && Array.isArray(result.data)) {
    const fn = async (p: Promise<null>, x: { data?: string }, i: number): Promise<null> => {
      if (hasImageData(x)) {
        return p.then(() =>
          convertURIToImageData(x.data).then((d) => {
            result.data[i].data = d;
            return null;
          }),
        );
      }
      return p;
    };
    await (result.data as [{ data: string }]).reduce(fn, Promise.resolve(null));
  }

  return context;
}
