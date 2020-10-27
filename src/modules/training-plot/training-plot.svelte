<script>
  import { onDestroy, onMount } from 'svelte';

  export let id;
  export let plotLosses;
  export let plotAccuracies;

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
