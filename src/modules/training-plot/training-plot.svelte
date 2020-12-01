<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import type { Chart } from '../chart';

  export let id: string;
  export let plotLosses: Chart;
  export let plotAccuracies: Chart;

  $: lossId = `${id}-${plotLosses.id}`;
  $: accId = `${id}-${plotAccuracies.id}`;

  onMount(() => {
    plotLosses.mount(`#${lossId}`);
    plotAccuracies.mount(`#${accId}`);
  });

  onDestroy(() => {
    plotLosses.destroy();
    plotAccuracies.destroy();
  });
</script>

<div class="grid grid-cols-1 xl:grid-cols-2 gap-1">
  <div id={lossId} class="card flex-none xl:flex-1 w-full" />
  <div id={accId} class="card flex-none xl:flex-1 w-full" />
</div>
