import { HookContext } from '@feathersjs/feathers';

export function addDatasetName(datasetName: string) {
  return (context: HookContext): HookContext => {
    const { data } = context;

    context.data = {
      datasetName,
      ...data,
    };

    return context;
  };
}

export function limitToDataset(datasetName: string) {
  return (context: HookContext): HookContext => {
    context.params = context.params || {};
    context.params.query = context.params.query || {};
    context.params.query.datasetName = datasetName;

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

const canvas2 = document.createElement('canvas');
const ctx2 = canvas2.getContext('2d');
const image2 = new Image();
function convertURIToImageData(URI: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    if (!URI) {
      reject();
    } else {
      image2.addEventListener(
        'load',
        () => {
          canvas2.width = image2.width;
          canvas2.height = image2.height;
          ctx2?.drawImage(image2, 0, 0, canvas2.width, canvas2.height);
          resolve(ctx2?.getImageData(0, 0, canvas2.width, canvas2.height));
        },
        false,
      );
      image2.src = URI;
    }
  });
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
