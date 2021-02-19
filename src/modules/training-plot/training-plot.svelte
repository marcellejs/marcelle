<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import type { Chart } from '../chart';

  export let charts: { [key: string]: Chart };

  let container: HTMLElement;

  onMount(async () => {
    await tick();
    Object.entries(charts).forEach(([name, chart]) => {
      const div = document.createElement('div');
      div.className = 'card flex-none xl:flex-1 w-full';
      container.appendChild(div);
      chart.mount(div);
    });
  });

  onDestroy(() => {
    Object.values(charts).forEach((chart) => {
      chart.destroy();
    });
  });
</script>

<div bind:this={container} class="grid grid-cols-1 xl:grid-cols-2 gap-1" />
