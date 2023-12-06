const tempVideoEl = document.createElement('video');
const canvas = document.createElement('canvas');
const thumbnailWidth = 100;

export async function getBlobMeta(blob: Blob): Promise<[number, string]> {
  console.log("Let's party", blob.size);
  let duration = await new Promise<number>((resolve, reject) => {
    tempVideoEl.addEventListener('loadedmetadata', () => {
      resolve(tempVideoEl.duration);
    });
    tempVideoEl.src = window.URL.createObjectURL(blob);
    tempVideoEl.onerror = (event: any) => reject(event.target.error);
  });
  console.log('BIBI', duration);
  if (duration === Infinity) {
    tempVideoEl.currentTime = Number.MAX_SAFE_INTEGER;
    duration = await new Promise<number>((resolve, reject) => {
      tempVideoEl.ontimeupdate = () => {
        console.log('ontimeupdate', tempVideoEl.duration);
        tempVideoEl.ontimeupdate = null;
        tempVideoEl.currentTime = 0;
        resolve(tempVideoEl.duration);
      };
      tempVideoEl.onerror = (event: any) => reject(event.target.error);
    });
  }
  console.log('Yo, blob duration', duration);
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
  console.log('Yo, thumbnail', thumbnail);

  return [duration, thumbnail];
}
