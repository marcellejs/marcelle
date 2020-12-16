<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import type { Chart } from '../chart';

  export let plotLosses: Chart;
  export let plotAccuracies: Chart;

  let lossElt: HTMLElement;
  let accElt: HTMLElement;

  onMount(async () => {
    await tick();
    plotLosses.mount(lossElt);
    plotAccuracies.mount(accElt);
  });

  onDestroy(() => {
    plotLosses.destroy();
    plotAccuracies.destroy();
  });
</script>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-1">
  <div bind:this={lossElt} class="card flex-none xl:flex-1 w-full" />
  <div bind:this={accElt} class="card flex-none xl:flex-1 w-full" />
</div>
