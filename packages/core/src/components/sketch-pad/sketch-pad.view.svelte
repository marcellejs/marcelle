<script lang="ts">
  import { onMount, createEventDispatcher, tick } from 'svelte';
  import { Stream } from '../../core';
  import { ViewContainer } from '@marcellejs/design-system';
  import { Button } from '@marcellejs/design-system';

  export let title: string;
  export let strokeStart: Stream<void>;
  export let strokeEnd: Stream<void>;

  let canvasElement: HTMLCanvasElement;
  let isDrawing = false;
  let offset = { left: 0, top: 0 };
  let previous = { x: 0, y: 0 };
  let ctx: CanvasRenderingContext2D;

  const dispatch = createEventDispatcher();

  function clearDrawing() {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    isDrawing = false;
  }

  onMount(async () => {
    await tick();
    await tick();
    ctx = canvasElement.getContext('2d');
    clearDrawing();
    dispatch('canvasElement', canvasElement);
  });

  function draw(e: MouseEvent) {
    const x = e.clientX - offset.left;
    const y = e.clientY - offset.top;
    if (isDrawing) {
      ctx.beginPath();
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 10;
      ctx.lineJoin = 'round';
      ctx.moveTo(previous.x, previous.y);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
    }
    previous.x = x;
    previous.y = y;
  }

  function startDrawing(e: MouseEvent) {
    const rect = canvasElement.getBoundingClientRect();
    offset = {
      top: rect.top + document.body.scrollTop,
      left: rect.left + document.body.scrollLeft,
    };
    draw(e);
    strokeStart.set();
    isDrawing = true;
  }

  function stopDrawing() {
    if (isDrawing) {
      strokeEnd.set();
    }
    isDrawing = false;
  }
</script>

<svelte:body on:mouseup={stopDrawing} />

<ViewContainer {title}>
  <div class="w-full flex flex-col items-center box-border">
    <canvas
      id="fxid"
      class="sketchpad-container"
      width="300"
      height="300"
      bind:this={canvasElement}
      on:mousemove={draw}
      on:mousedown={startDrawing}
    />
    <div class="m-1">
      <Button size="small" type="danger" on:click={clearDrawing}>Clear</Button>
    </div>
  </div>
</ViewContainer>

<style lang="postcss">
  .sketchpad-container {
    @apply overflow-hidden flex justify-center m-1 border border-solid border-gray-400 rounded-lg;
    width: 300px;
    height: 300px;
  }
</style>
