const tempVideoEl = document.createElement('video');
const canvas = document.createElement('canvas');
const thumbnailWidth = 100;

export async function getBlobMeta(blob: Blob): Promise<[number, string]> {
  let duration = await new Promise<number>((resolve, reject) => {
    tempVideoEl.addEventListener('loadedmetadata', () => {
      resolve(tempVideoEl.duration);
    });
    tempVideoEl.src = window.URL.createObjectURL(blob);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tempVideoEl.onerror = (event: any) => reject(event.target.error);
  });
  if (duration === Infinity) {
    tempVideoEl.currentTime = Number.MAX_SAFE_INTEGER;
    duration = await new Promise<number>((resolve, reject) => {
      tempVideoEl.ontimeupdate = () => {
        tempVideoEl.ontimeupdate = null;
        tempVideoEl.currentTime = 0;
        resolve(tempVideoEl.duration);
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tempVideoEl.onerror = (event: any) => reject(event.target.error);
    });
  }
  const thumbnail = await new Promise<string>((resolve, reject) => {
    // Get Thumbnail
    const cb = () => {
      try {
        canvas.width = thumbnailWidth;
        canvas.height = (thumbnailWidth * tempVideoEl.videoHeight) / tempVideoEl.videoWidth;

        const w = (canvas.height * tempVideoEl.videoWidth) / tempVideoEl.videoHeight;

        // canvas.getContext('2d').drawImage(tempVideoEl, 0, 0, canvas.width, canvas.height);
        canvas
          .getContext('2d')
          .drawImage(tempVideoEl, canvas.width / 2 - w / 2, 0, w, canvas.height);
        const thumb = canvas.toDataURL('image/jpeg');
        tempVideoEl.pause();
        tempVideoEl.removeEventListener('timeupdate', cb);
        resolve(thumb);
      } catch (error) {
        reject(error);
      }
    };
    tempVideoEl.addEventListener('timeupdate', cb);
    tempVideoEl.currentTime = duration / 2;
  });

  return [duration, thumbnail];
}
