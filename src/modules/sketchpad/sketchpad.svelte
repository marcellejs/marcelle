<script lang="ts">
  import { onMount, createEventDispatcher, tick } from 'svelte';
  import { Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title: string;
  export let strokeStart: Stream<void>;
  export let strokeEnd: Stream<void>;

  let canvasElement: HTMLCanvasElement;
  let isDrawing = false;
  let offset = { left: 0, top: 0 };
  let previous = { x: 0, y: 0 };
  let ctx: CanvasRenderingContext2D;

  const dispatch = createEventDispatcher();

  onMount(async () => {
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

  function clearDrawing() {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    isDrawing = false;
  }
</script>

<style lang="postcss">
  .sketchpad {
    @apply w-full flex flex-col box-border;
  }

  .sketchpad .sketchpad-container {
    @apply overflow-hidden flex justify-center m-1 border-gray-600 border;
    width: 300px;
    height: 300px;
  }

  .sketchpad .controls {
    @apply m-1;
  }
</style>

<svelte:body on:mouseup={stopDrawing} />

<ModuleBase {title}>
  <div class="sketchpad">
    <canvas
      id="fxid"
      class="sketchpad-container"
      width="300"
      height="300"
      bind:this={canvasElement}
      on:mousemove={draw}
      on:mousedown={startDrawing} />
    <div class="controls">
      <button class="btn small danger" on:click={clearDrawing}> Clear </button>
    </div>
  </div>
</ModuleBase>
