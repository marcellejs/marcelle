<script lang="ts">
  import { onDestroy, onMount, tick } from 'svelte';
  import type { GenericChart } from '../generic-chart';

  interface Props {
    charts: Record<string, GenericChart>;
  }

  let { charts }: Props = $props();

  let container: HTMLElement = $state();
  let refs: HTMLDivElement[] = $state([]);
  let destroy: Array<() => void> = [];

  onMount(async () => {
    await tick();
    await tick();

    if (Object.keys(charts).length > 1 && container.clientWidth > 700) {
      container.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
    }

    for (const [i, chart] of Object.values(charts).entries()) {
      destroy.push(chart.mount(refs[i]));
    }
  });

  onDestroy(() => {
    for (const f of destroy) {
      f();
    }
  });
</script>

<div bind:this={container} class="mcl:grid mcl:grid-cols-1 mcl:gap-1">
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
  {#each Object.values(charts) as _, i (i)}
    <div
      bind:this={refs[i]}
      class="mcl:card mcl:w-full mcl:flex-none mcl:shadow-none mcl:xl:flex-1"
    ></div>
  {/each}
</div>
