<script>
  import { onMount } from 'svelte';
  import { derived } from 'svelte/store';
  import { tidy, browser, scalar } from '@tensorflow/tfjs-core';
  import { Notyf } from 'notyf';
  import 'notyf/notyf.min.css';
  import Switch from '../../core/components/Switch.svelte';
  import { active, width, height, stream, tensors, thumbnails } from './webcam.store';

  export let title;
  let camerasListEmitted = false;
  let cameras = [];
  let deviceId = null;
  let source = null;
  let videoElement = null;
  let ready = false;

  const IMAGE_SIZE = 224;

  const notyf = new Notyf({
    duration: 3000,
    position: {
      x: 'right',
      y: 'top',
    },
    dismissible: true,
    ripple: false,
  });

  onMount(() => {
    setupMedia();
  });

  active.subscribe(v => {
    if (v) {
      if (!camerasListEmitted) {
        loadCameras();
      } else {
        start();
      }
    } else {
      stop();
      stream.set(false);
    }
  });

  let animationFrame;
  stream.subscribe(s => {
    if (s) {
      process();
    } else {
      cancelAnimationFrame(animationFrame);
    }
  });

  function process() {
    animationFrame = requestAnimationFrame(process);
    tensors.set(captureTensor());
    thumbnails.set(captureThumbnail());
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
        notyf.error('Webcam not supported');
      });
  }

  function loadCamera(device) {
    const constraints = { video: { deviceId: { exact: device } } };
    // if (resolution) {
    //   constraints.video.height = resolution.height;
    //   constraints.video.width = resolution.width;
    // }
    return navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => loadSrcStream(stream))
      .catch(error => {
        notyf.error(`Error loading camera: ${error}`);
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
      canvas.height = videoElement.videoHeight;
      canvas.width = videoElement.videoWidth;
      ctx = canvas.getContext('2d');
    }
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  }

  function captureTensor() {
    return tidy(() => {
      const webcamImage = browser.fromPixels(videoElement);

      // Crop the image so we're using the center square of the rectangular
      // webcam.
      const croppedImage = cropImage(webcamImage);

      // // Expand the outer most dimension so we have a batch size of 1.
      // const batchedImage = croppedImage.expandDims(0);

      const offset = scalar(127.5);
      // Normalize the image from [0, 255] to [-1, 1].
      const normalized = croppedImage
        .toFloat()
        .sub(offset)
        .div(offset);

      const batched = normalized.reshape([1, IMAGE_SIZE, IMAGE_SIZE, 3]);
      return batched;
    });
  }

  function cropImage(img) {
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - IMAGE_SIZE / 2;
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - IMAGE_SIZE / 2;
    return img.slice([beginHeight, beginWidth, 0], [IMAGE_SIZE, IMAGE_SIZE, 3]);
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
    @apply rounded overflow-hidden bg-gray-200;
    width: 300px;
    height: 300px;
    overflow: hidden;
    display: flex;
    justify-content: center;
    margin: 10px;
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
  <div class="webcam-container">
    <video
      id="webcam-video"
      class="max-w-none"
      bind:this={videoElement}
      height={$height}
      src={source}
      width={$width}
      autoplay
      muted
      playsinline />
  </div>
</div>
