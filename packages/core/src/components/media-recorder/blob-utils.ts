const tempVideoEl = document.createElement('video');
const canvas = document.createElement('canvas');
const thumbnailWidth = 100;

export async function getBlobMeta(blob: Blob): Promise<[number, string]> {
  const durationP = new Promise<[number, string]>((resolve, reject) => {
    tempVideoEl.addEventListener('loadedmetadata', () => {
      let duration: number;
      // Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=642012
      if (tempVideoEl.duration === Infinity) {
        tempVideoEl.currentTime = Number.MAX_SAFE_INTEGER;
        tempVideoEl.ontimeupdate = () => {
          tempVideoEl.ontimeupdate = null;
          duration = tempVideoEl.duration;
          tempVideoEl.currentTime = 0;
        };
      }
      // Normal behavior
      else {
        duration = tempVideoEl.duration;
      }
      // Get Thumbnail
      const cb = (x) => {
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
        resolve([duration, thumb]);
      };
      tempVideoEl.addEventListener('timeupdate', cb);
      tempVideoEl.currentTime = duration / 2;
    });
    tempVideoEl.onerror = (event: any) => reject(event.target.error);
  });

  tempVideoEl.src = window.URL.createObjectURL(blob);

  return durationP;
}
