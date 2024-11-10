<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { BehaviorSubject, Observable, Subscription } from 'rxjs';

  interface Props {
    width: number;
    height: number;
    facingMode: BehaviorSubject<'user' | 'environment'>;
    active: Observable<boolean>;
    mediaStream: Observable<MediaStream>;
    ready: Observable<boolean>;
  }

  let { width, height, facingMode, active, mediaStream, ready }: Props = $props();

  let videoElement: HTMLVideoElement = $state();
  let webcamContainerWidth: number = $state();

  let numWebcams = $state(0);
  let sub: Subscription;
  onMount(async () => {
    await tick();
    await tick();
    sub = mediaStream.subscribe((s) => {
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
            console.error(`${err.name}: ${err.message}`);
          });
      }
    });
  });

  onDestroy(() => {
    if (sub) {
      sub.unsubscribe();
    }
  });
</script>

<div class="webcam">
  <div>
    <div class="mcl-form-control">
      <label class="mcl-label mcl-cursor-pointer">
        <input type="checkbox" class="mcl-toggle" bind:checked={$active} />
        <span class="mcl-label-text mcl-ml-2">activate video</span>
      </label>
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
      <span
        class="mcl-absolute mcl-inset-0 mcl-flex mcl-w-full mcl-flex-nowrap mcl-items-center mcl-justify-center"
      >
        <span class="mcl-loading mcl-loading-spinner mcl-loading-lg"></span>
      </span>
    {/if}
    <video
      id="webcam-video"
      class="mcl-max-w-none"
      class:mirror={$facingMode === 'user'}
      style="width: {width > height ? `${webcamContainerWidth}px` : 'auto'}; height: {width > height
        ? 'auto'
        : `${(webcamContainerWidth * height) / width}px`};"
      bind:this={videoElement}
      autoplay
      muted
      playsinline
    ></video>
    {#if numWebcams > 1}
      <div class="mcl-absolute mcl-bottom-2 mcl-right-2 mcl-text-right">
        <button
          class="mcl-btn mcl-btn-circle mcl-btn-ghost"
          onclick={() => facingMode.next(facingMode.getValue() === 'user' ? 'environment' : 'user')}
          aria-label="switch camera"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="mcl-h-6 mcl-w-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
        </button>
      </div>
    {/if}
  </div>
</div>

<style lang="postcss">
  .webcam {
    @apply mcl-mt-2 mcl-flex mcl-w-full mcl-flex-col mcl-items-center mcl-text-center;
  }

  .webcam .webcam-container {
    @apply mcl-m-2 mcl-flex mcl-w-full mcl-justify-center mcl-overflow-hidden mcl-rounded-md mcl-bg-base-300;
    max-width: 350px;
  }

  .mirror {
    transform: scaleX(-1);
  }
</style>
