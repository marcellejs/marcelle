<svelte:options accessors />

<script lang="ts">
  import type { Stream } from '../../core/stream';
  import { onDestroy, onMount, tick } from 'svelte';
  import { ViewContainer } from '@marcellejs/design-system';
  import { noop } from '../../utils/misc';

  export let title: string;
  export let imageStream: Stream<ImageData> | Stream<ImageData[]>;

  let canvas: HTMLCanvasElement;

  let unSub = noop;
  onMount(async () => {
    await tick();
    await tick();
    const ctx = canvas.getContext('2d');
    unSub = imageStream.subscribe((img: ImageData | ImageData[]) => {
      if (Array.isArray(img) && img.length === 0) return;
      if (img instanceof ImageData) {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.putImageData(img, 0, 0);
      } else if (Array.isArray(img)) {
        throw new Error('This component does not yet support multiple images');
      }
    });
  });

  onDestroy(() => {
    unSub();
  });
</script>

<ViewContainer {title}>
  <canvas bind:this={canvas} class="w-full max-w-full" />
</ViewContainer>
