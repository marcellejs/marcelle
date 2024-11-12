const conversionCanvas1 = document.createElement('canvas');
const conversionCtx1 = conversionCanvas1.getContext('2d');
const conversionImage1 = new Image();

export function convertURIToImageData(URI: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    if (!URI) {
      reject();
    } else {
      conversionImage1.addEventListener(
        'load',
        () => {
          conversionCanvas1.width = conversionImage1.width;
          conversionCanvas1.height = conversionImage1.height;
          conversionCtx1?.drawImage(
            conversionImage1,
            0,
            0,
            conversionCanvas1.width,
            conversionCanvas1.height,
          );
          resolve(
            conversionCtx1?.getImageData(0, 0, conversionCanvas1.width, conversionCanvas1.height),
          );
        },
        false,
      );
      conversionImage1.src = URI;
    }
  });
}

const conversionCanvas2 = document.createElement('canvas');
const conversionCtx2 = conversionCanvas2.getContext('2d');
export function convertImageDataToBlob(imageData: ImageData, type = 'image/png'): Promise<Blob> {
  const w = imageData.width;
  const h = imageData.height;
  conversionCanvas2.width = w;
  conversionCanvas2.height = h;
  conversionCtx2.putImageData(imageData, 0, 0); // synchronous

  return new Promise<Blob>((resolve) => {
    conversionCanvas2.toBlob(resolve, type); // implied image/png format
  });
}
