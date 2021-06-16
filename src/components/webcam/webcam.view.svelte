<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import type { Stream } from '../../core';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import Spinner from '../../ui/components/Spinner.svelte';
  import Switch from '../../ui/components/Switch.svelte';
  import { noop } from '../../utils/misc';

  export let title: string;
  export let width: number;
  export let height: number;
  export let active: Stream<boolean>;
  export let mediaStream: Stream<MediaStream>;
  export let ready: Stream<boolean>;

  let videoElement: HTMLVideoElement;
  let webcamContainerWidth;

  let unSub = noop;
  onMount(async () => {
    await tick();
    await tick();
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

<ViewContainer {title}>
  <div class="webcam">
    <div style="margin-left: 10px;">
      <div>
        <Switch text="activate video" bind:checked={$active} />
      </div>
    </div>
    <div
      class="webcam-container"
      bind:clientWidth={webcamContainerWidth}
      style="flex-direction: {width > height ? 'column' : 'row'};height: {(webcamContainerWidth *
        height) /
        width}px"
    >
      {#if $active && !$ready}
        <Spinner />
      {/if}
      <video
        id="webcam-video"
        class="max-w-none"
        style="width: {width > height ? `${webcamContainerWidth}px` : 'auto'}; height: {width >
        height
          ? 'auto'
          : `${(webcamContainerWidth * height) / width}px`}"
        bind:this={videoElement}
        autoplay
        muted
        playsinline
      />
    </div>
  </div>
</ViewContainer>

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
