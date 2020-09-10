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
    ctx1.putImageData(data.data, w, h); // synchronous

    context.data.data = canvas1.toDataURL('image/jpeg');
  }

  return context;
}

export async function dataURL2ImageData(context: HookContext): Promise<HookContext> {
  if (!context.result) return context;
  const { result } = context;

  const hasImageData = (x: { data?: string }) =>
    x.data && typeof x.data === 'string' && x.data.slice(0, 22) === 'data:image/jpeg;base64';

  // eslint-disable-next-line no-underscore-dangle
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
