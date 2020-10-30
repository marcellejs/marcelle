const canvas2 = document.createElement('canvas');
const ctx2 = canvas2.getContext('2d');
const image2 = new Image();

export function convertURIToImageData(URI: string): Promise<ImageData> {
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
