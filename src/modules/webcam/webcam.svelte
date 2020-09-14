<script>
  import { noop } from 'svelte/internal';
  import { onMount, onDestroy } from 'svelte';
  import Spinner from '../../ui/widgets/Spinner.svelte';
  import Switch from '../../ui/widgets/Switch.svelte';

  export let title;
  export let width;
  export let height;
  export let active;
  export let mediaStream;
  export let ready;

  let videoElement = null;
  let webcamContainerWidth;

  let unSub = noop;
  onMount(async () => {
    await new Promise((resolve, reject) => {
      const rej = setTimeout(() => {
        reject();
      }, 5000);
      const int = setInterval(() => {
        if (videoElement) {
          clearTimeout(rej);
          clearInterval(int);
          resolve();
        }
      }, 200);
    });
    unSub = mediaStream.subscribe((s) => {
      if (s) {
        videoElement.srcObject = s;
      }
    });
  });

  onDestroy(() => {
    unSub();
  });
</script>

<style lang="postcss">
  .webcam {
    @apply mt-2 w-full text-center flex flex-col items-center;
  }

  .webcam .webcam-container {
    @apply rounded-md overflow-hidden bg-gray-200 m-2 w-full flex justify-center;
    max-width: 350px;
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
  </div>
  <div
    class="webcam-container"
    bind:clientWidth={webcamContainerWidth}
    style="flex-direction: {width > height ? 'column' : 'row'};height: {(webcamContainerWidth * height) / width}px">
    {#if $active && !$ready}
      <Spinner />
    {/if}
    <video
      id="webcam-video"
      class="max-w-none"
      style="width: {width > height ? `${webcamContainerWidth}px` : 'auto'}; height: {width > height ? 'auto' : `${(webcamContainerWidth * height) / width}px`}"
      bind:this={videoElement}
      autoplay
      muted
      playsinline />
  </div>
</div>
