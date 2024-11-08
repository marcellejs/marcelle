<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { BehaviorSubject, Observable, Subscription } from 'rxjs';

  export let width: number;
  export let height: number;
  export let facingMode: BehaviorSubject<'user' | 'environment'>;
  export let active: Observable<boolean>;
  export let mediaStream: Observable<MediaStream>;
  export let ready: Observable<boolean>;

  let videoElement: HTMLVideoElement;
  let webcamContainerWidth: number;

  let numWebcams = 0;
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
            // eslint-disable-next-line no-console
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
  <div class="">
    <div class="mco-form-control">
      <label class="mco-label cursor-pointer">
        <input type="checkbox" class="mco-toggle" bind:checked={$active} />
        <span class="mco-label-text ml-2">activate video</span>
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
      <span class="absolute inset-0 flex w-full flex-nowrap items-center justify-center">
        <span class="loading loading-spinner loading-lg"></span>
      </span>
    {/if}
    <video
      id="webcam-video"
      class="max-w-none"
      class:mirror={$facingMode === 'user'}
      style="width: {width > height ? `${webcamContainerWidth}px` : 'auto'}; height: {width > height
        ? 'auto'
        : `${(webcamContainerWidth * height) / width}px`};"
      bind:this={videoElement}
      autoplay
      muted
      playsinline
    />
    {#if numWebcams > 1}
      <div class="absolute bottom-2 right-2 text-right">
        <button
          class="ghost btn btn-circle"
          on:click={() =>
            facingMode.next(facingMode.getValue() === 'user' ? 'environment' : 'user')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="h-6 w-6"
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
    @apply mt-2 flex w-full flex-col items-center text-center;
  }

  .webcam .webcam-container {
    @apply m-2 flex w-full justify-center overflow-hidden rounded-md bg-base-300;
    max-width: 350px;
  }

  .mirror {
    transform: scaleX(-1);
  }
</style>
