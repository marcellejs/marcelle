<script>
  import { onMount } from 'svelte';
  import { derived, get } from 'svelte/store';
  import { tidy, browser, scalar } from '@tensorflow/tfjs-core';
  import notify from '../../core/util/notify';
  import Switch from '../../core/components/Switch.svelte';

  export let title;
  export let width;
  export let height;
  export let store;
  $: ({ active, tensors, stream, thumbnails } = store);

  let camerasListEmitted = false;
  let cameras = [];
  let deviceId = null;
  let source = null;
  let videoElement = null;
  let ready = false;
  let webcamWidth;
  let webcamHeight;
  let w;

  const THUMBNAIL_WIDTH = 80;

  onMount(async () => {
    setupMedia();
    setupStreaming();

    active.subscribe(v => {
      if (v) {
        if (!camerasListEmitted) {
          loadCameras();
        } else {
          start();
        }
      } else {
        stop();
        stream && stream.set(false);
      }
    });
  });

  function setupStreaming() {
    let animationFrame;
    stream.subscribe(s => {
      if (s) {
        process();
      } else {
        cancelAnimationFrame(animationFrame);
      }
    });

    function process() {
      // tf.dispose(get(tensors));
      tensors.set(captureTensor());
      const t = captureThumbnail();
      thumbnails.set(t);
      animationFrame = requestAnimationFrame(process);
    }
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

  function loadCameras() {
    navigator.mediaDevices
      .enumerateDevices()
      .then(deviceInfos => {
        for (let i = 0; i !== deviceInfos.length; i += 1) {
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

  function loadCamera(device) {
    const constraints = {
      video: {
        deviceId: { exact: device },
      },
    };
    return navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        webcamWidth = stream.getVideoTracks()[0].getSettings().width;
        webcamHeight = stream.getVideoTracks()[0].getSettings().height;
        return loadSrcStream(stream);
      })
      .catch(error => {
        notify({
          title: 'Error loading camera',
          message: error,
          type: 'danger',
        });
      });
  }

  function loadSrcStream(stream) {
    if ('srcObject' in videoElement) {
      // new browsers api
      videoElement.srcObject = stream;
    } else {
      // old broswers
      source = window.HTMLMediaElement.srcObject(stream);
    }
    // Emit video start/live event
    videoElement.onloadedmetadata = () => {
      ready = true;
    };
    // this.$emit('started', stream);
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

  function stopStreamedVideo(videoElem) {
    const stream = videoElem.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => {
      track.stop();
      // this.$emit('stopped', stream);
      videoElement.srcObject = null;
      source = null;
    });
    ready = false;
  }

  let ctx, canvas;
  function captureThumbnail() {
    if (!ctx) {
      canvas = document.createElement('canvas');
      canvas.width = THUMBNAIL_WIDTH;
      canvas.height = (THUMBNAIL_WIDTH * height) / width;
      ctx = canvas.getContext('2d');
    }
    const hRatio = height / webcamHeight;
    const wRatio = width / webcamWidth;
    const centerHeight = canvas.height / 2;
    const beginHeight = centerHeight - height / 2;
    const centerWidth = canvas.width / 2;
    const beginWidth = centerWidth - width / 2;
    if (hRatio > wRatio) {
      const w = (canvas.height * webcamWidth) / webcamHeight;
      ctx.drawImage(videoElement, canvas.width / 2 - w / 2, 0, w, canvas.height);
    } else {
      const h = (canvas.width * webcamHeight) / webcamWidth;
      ctx.drawImage(videoElement, 0, canvas.height / 2 - h / 2, canvas.width, h);
    }
    return canvas.toDataURL('image/jpeg');
  }

  function captureTensor() {
    console.log('numTensors (): ' + tf.memory().numTensors);
    return tidy(() => {
      const webcamImage = browser.fromPixels(videoElement);
      const hRatio = height / webcamHeight;
      const wRatio = width / webcamWidth;
      const size =
        hRatio > wRatio
          ? [height, Math.round((height * webcamWidth) / webcamHeight)]
          : [Math.round((width * webcamHeight) / webcamWidth), width];
      const newImg = tf.image.resizeBilinear(webcamImage, size);

      // Crop the image so we're using the center square of the rectangular
      // webcam.
      const croppedImage = cropImage(newImg);

      // // Expand the outer most dimension so we have a batch size of 1.
      // const batchedImage = croppedImage.expandDims(0);

      const offset = scalar(127.5);
      // Normalize the image from [0, 255] to [-1, 1].
      const normalized = croppedImage
        .toFloat()
        .sub(offset)
        .div(offset);

      const batched = normalized.reshape([1, height, width, 3]);
      return batched.arraySync();
    });
  }

  function cropImage(img) {
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - height / 2;
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - width / 2;
    return img.slice([beginHeight, beginWidth, 0], [height, width, 3]);
  }
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
    bind:clientWidth={w}
    style="flex-direction: {width > height ? 'column' : 'row'};height: {(w * height) / width}px">
    <video
      id="webcam-video"
      class="max-w-none"
      style="width: {width > height ? `${w}px` : 'auto'}; height: {width > height ? 'auto' : `${(w * height) / width}px`}"
      bind:this={videoElement}
      src={source}
      autoplay
      muted
      playsinline />
  </div>
</div>
