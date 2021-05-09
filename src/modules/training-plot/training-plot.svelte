<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import type { GenericChart } from '../generic-chart';

  export let charts: { [key: string]: GenericChart };

  let container: HTMLElement;

  onMount(async () => {
    await tick();
    await tick();

    if (Object.keys(charts).length > 1 && container.clientWidth > 700) {
      container.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    }
    for (const chart of Object.values(charts)) {
      const div = document.createElement('div');
      div.className = 'card flex-none xl:flex-1 w-full';
      container.appendChild(div);
      chart.mount(div);
    }
  });

  onDestroy(() => {
    for (const chart of Object.values(charts)) {
      chart.destroy();
    }
  });
</script>

<div bind:this={container} class="grid grid-cols-1 gap-1" />
