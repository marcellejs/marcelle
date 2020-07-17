<script>
  import { onMount, onDestroy } from 'svelte';
  import Spinner from '../../core/components/Spinner.svelte';
  import notify from '../../core/util/notify';
  import Switch from '../../core/components/Switch.svelte';

  export let title;
  export let width;
  export let height;
  export let active;
  export let images;
  export let stream;
  export let thumbnails;

  let camerasListEmitted = false;
  const cameras = [];
  let deviceId = null;
  let source = null;
  let videoElement = null;
  let ready = false;
  let webcamWidth;
  let webcamHeight;
  let webcamContainerWidth;

  const THUMBNAIL_WIDTH = 80;

  const thumbnailCanvas = document.createElement('canvas');
  thumbnailCanvas.width = THUMBNAIL_WIDTH;
  thumbnailCanvas.height = (THUMBNAIL_WIDTH * height) / width;
  const thumbnailCtx = thumbnailCanvas.getContext('2d');
  function captureThumbnail() {
    if (!ready) return null;
    const hRatio = height / webcamHeight;
    const wRatio = width / webcamWidth;
    if (hRatio > wRatio) {
      const w = (thumbnailCanvas.height * webcamWidth) / webcamHeight;
      thumbnailCtx.drawImage(
        videoElement,
        thumbnailCanvas.width / 2 - w / 2,
        0,
        w,
        thumbnailCanvas.height,
      );
    } else {
      const h = (thumbnailCanvas.width * webcamHeight) / webcamWidth;
      thumbnailCtx.drawImage(
        videoElement,
        0,
        thumbnailCanvas.height / 2 - h / 2,
        thumbnailCanvas.width,
        h,
      );
    }
    return thumbnailCanvas.toDataURL('image/jpeg');
  }

  const captureCanvas = document.createElement('canvas');
  captureCanvas.width = width;
  captureCanvas.height = height;
  const captureCtx = captureCanvas.getContext('2d');
  function captureImage() {
    if (!ready) return null;
    const hRatio = height / webcamHeight;
    const wRatio = width / webcamWidth;
    if (hRatio > wRatio) {
      const w = (height * webcamWidth) / webcamHeight;
      captureCtx.drawImage(videoElement, width / 2 - w / 2, 0, w, height);
    } else {
      const h = (width * webcamHeight) / webcamWidth;
      captureCtx.drawImage(videoElement, 0, height / 2 - h / 2, width, h);
    }
    return captureCanvas.toDataURL('image/jpeg');
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let unsubStreaming = () => {};
  let animationFrame;
  function setupStreaming() {
    function process() {
      images.set(captureImage());
      thumbnails.set(captureThumbnail());
      animationFrame = requestAnimationFrame(process);
    }

    unsubStreaming = stream.subscribe(s => {
      cancelAnimationFrame(animationFrame);
      if (s) {
        process();
      }
    });
  }

  let srcStream;
  function loadSrcStream(s) {
    srcStream = s;

    if ('srcObject' in videoElement) {
      // new browsers api
      videoElement.srcObject = s;
    } else {
      // old broswers
      source = window.HTMLMediaElement.srcObject(s);
    }
    // Emit video start/live event
    videoElement.onloadedmetadata = () => {
      ready = true;
    };
  }

  function loadCamera(device) {
    const constraints = {
      video: {
        deviceId: { exact: device },
      },
    };
    return navigator.mediaDevices
      .getUserMedia(constraints)
      .then(s => {
        webcamWidth = s.getVideoTracks()[0].getSettings().width;
        webcamHeight = s.getVideoTracks()[0].getSettings().height;
        return loadSrcStream(s);
      })
      .catch(error => {
        notify({
          title: 'Error loading camera',
          message: error,
          type: 'danger',
        });
      });
  }

  function loadCameras() {
    navigator.mediaDevices
      .enumerateDevices()
      .then(deviceInfos => {
        for (let i = 0; i !== deviceInfos.length; i++) {
          const deviceInfo = deviceInfos[i];
          if (deviceInfo.kind === 'videoinput') {
            cameras.push(deviceInfo);
          }
        }
      })
      .then(() => {
        if (!camerasListEmitted) {
          // this.$emit('cameras', this.cameras);
          camerasListEmitted = true;
        }
        if (cameras.length === 1) {
          deviceId = cameras[0].deviceId;
          loadCamera(cameras[0].deviceId);
        }
      })
      .catch(error => {
        notify({
          title: 'Webcam not supported',
          message: error,
          type: 'danger',
        });
      });
  }

  function stopStreamedVideo(videoElem) {
    const s = videoElem.srcObject;
    const tracks = s.getTracks();
    tracks.forEach(track => {
      track.stop();
      // this.$emit('stopped', stream);
      videoElement.srcObject = null;
      source = null;
    });
    ready = false;
  }

  function start() {
    if (deviceId) {
      loadCamera(deviceId);
    }
  }

  function stop() {
    if (videoElement !== null && videoElement.srcObject) {
      stopStreamedVideo(videoElement);
    }
  }

  function legacyGetUserMediaSupport() {
    return constraints => {
      // First get ahold of the legacy getUserMedia, if present
      const getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia ||
        navigator.oGetUserMedia;
      // Some browsers just don't implement it - return a rejected promise with an error
      // to keep a consistent interface
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
      }
      // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  function setupMedia() {
    if (navigator.mediaDevices === undefined) {
      navigator.mediaDevices = {};
    }
    if (navigator.mediaDevices.getUserMedia === undefined) {
      navigator.mediaDevices.getUserMedia = legacyGetUserMediaSupport();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let unsubActive = () => {};
  onMount(() => {
    setupMedia();
    setupStreaming();
    unsubActive = active.subscribe(v => {
      if (v) {
        if (!camerasListEmitted) {
          loadCameras();
        } else {
          start();
        }
      } else {
        stop();
        if (stream) {
          stream.set(false);
        }
      }
    });
  });

  onDestroy(() => {
    cancelAnimationFrame(animationFrame);
    unsubActive();
    unsubStreaming();
    if (srcStream) {
      srcStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  });
</script>

<style lang="postcss">
  .webcam {
    @apply mt-2;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .webcam .webcam-container {
    @apply rounded-md overflow-hidden bg-gray-200 m-2;
    overflow: hidden;
    display: flex;
    justify-content: center;
  }

  video {
    transform: scaleX(-1);
  }
</style>

<span class="card-title">{title}</span>
<div class="webcam">
  <div style="margin-left: 10px;">
    <div>
      <Switch text="activate video" bind:checked={$active} />
    </div>
    <div>
      <Switch text="stream" bind:checked={$stream} disabled={!ready} />
    </div>
  </div>
  <div
    class="webcam-container"
    bind:clientWidth={webcamContainerWidth}
    style="flex-direction: {width > height ? 'column' : 'row'};height: {(webcamContainerWidth * height) / width}px">
    {#if $active && !ready}
      <Spinner />
    {/if}
    <video
      id="webcam-video"
      class="max-w-none"
      style="width: {width > height ? `${webcamContainerWidth}px` : 'auto'}; height: {width > height ? 'auto' : `${(webcamContainerWidth * height) / width}px`}"
      bind:this={videoElement}
      src={source}
      autoplay
      muted
      playsinline />
  </div>
</div>
