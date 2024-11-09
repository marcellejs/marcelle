<svelte:options />

<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import { Observable, Subscription } from 'rxjs';

  interface Props {
    imageStream: Observable<ImageData | ImageData[]>;
  }

  let { imageStream }: Props = $props();

  let canvas: HTMLCanvasElement = $state();

  let sub: Subscription;
  onMount(async () => {
    await tick();
    await tick();
    const ctx = canvas.getContext('2d');
    sub = imageStream.subscribe((img: ImageData | ImageData[]) => {
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
    if (sub) sub.unsubscribe();
  });

  export {
  	imageStream,
  }
</script>

<canvas bind:this={canvas} class="w-full max-w-full"></canvas>
