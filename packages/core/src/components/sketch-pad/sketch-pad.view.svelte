<script lang="ts">
  import type { Subject } from 'rxjs';
  import { onMount, createEventDispatcher, tick } from 'svelte';

  interface Props {
    strokeStart: Subject<void>;
    strokeEnd: Subject<void>;
  }

  let { strokeStart, strokeEnd }: Props = $props();

  let canvasElement: HTMLCanvasElement = $state();
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
    strokeStart.next();
    isDrawing = true;
  }

  function stopDrawing() {
    if (isDrawing) {
      strokeEnd.next();
    }
    isDrawing = false;
  }
</script>

<svelte:body onmouseup={stopDrawing} />

<div class="box-border flex w-full flex-col items-center">
  <canvas
    id="fxid"
    class="sketchpad-container"
    width="300"
    height="300"
    bind:this={canvasElement}
    onmousemove={draw}
    onmousedown={startDrawing}
></canvas>
  <div class="m-1">
    <button class="mco-btn mco-btn-sm mco-btn-error" onclick={clearDrawing}>Clear</button>
  </div>
</div>

<style lang="postcss">
  .sketchpad-container {
    @apply m-1 flex justify-center overflow-hidden rounded-lg border border-solid border-gray-400;
    width: 300px;
    height: 300px;
  }
</style>
