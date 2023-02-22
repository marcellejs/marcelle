<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import type { Stream } from '../../core';
  import { Button, ViewContainer } from '@marcellejs/design-system';
  import { Spinner, Switch } from '@marcellejs/design-system';
  import { noop } from '../../utils/misc';

  export let title: string;
  export let width: number;
  export let height: number;
  export let facingMode: Stream<'user' | 'environment'>;
  export let active: Stream<boolean>;
  export let mediaStream: Stream<MediaStream>;
  export let ready: Stream<boolean>;

  let videoElement: HTMLVideoElement;
  let webcamContainerWidth: number;

  let numWebcams = 0;
  let unSub = noop;
  onMount(async () => {
    await tick();
    await tick();
    unSub = mediaStream.subscribe((s) => {
      if (s) {
        videoElement.srcObject = s;
      }
      if (navigator.mediaDevices?.enumerateDevices) {
        navigator.mediaDevices
          .enumerateDevices()
          .then((devices) => devices.filter((device) => device.kind === 'videoinput'))
          .then((videoDevices) => {
            numWebcams = videoDevices.length;
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.error(`${err.name}: ${err.message}`);
          });
      }
    });
  });

  onDestroy(() => {
    unSub();
  });
</script>

<ViewContainer {title}>
  <div class="webcam">
    <div>
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
        class:mirror={$facingMode === 'user'}
        style="width: {width > height ? `${webcamContainerWidth}px` : 'auto'}; height: {width >
        height
          ? 'auto'
          : `${(webcamContainerWidth * height) / width}px`};"
        bind:this={videoElement}
        autoplay
        muted
        playsinline
      />
      {#if numWebcams > 1}
        <div class="absolute bottom-2 right-2 text-right">
          <Button
            round
            on:click={() => facingMode.set(facingMode.get() === 'user' ? 'environment' : 'user')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
              />
            </svg>
          </Button>
        </div>
      {/if}
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

  .mirror {
    transform: scaleX(-1);
  }
</style>
