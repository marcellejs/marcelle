<script lang="ts">
  import { run } from 'svelte/legacy';

  import { onDestroy } from 'svelte';

  import type { Instance, Model, TrainingStatus } from '../../core';
  import { type TrainingPlot, trainingPlot } from '../training-plot';
  import { BehaviorSubject } from 'rxjs';

  interface Props {
    names: string[];
    logs: Array<Record<string, unknown>>;
  }

  let { names, logs }: Props = $props();

  let chartElt: HTMLDivElement = $state();

  let logKeys: string[] = $state();
  run(() => {
    logKeys = Array.from(new Set(logs.map(Object.keys).flat()));
    logKeys.sort();
  });
  let indexedLogs = $derived(
    logs
      .map((x, i) =>
        Object.entries(x).reduce((a, [key, val]) => ({ ...a, [`${key} (${names[i]})`]: val }), {}),
      )
      .reduce((a, b) => ({ ...a, ...b }), {}),
  );
  let logSpec = $derived(
    logKeys.reduce(
      (res, key) => ({
        ...res,
        [key]: Object.keys(indexedLogs).filter((k) => k.startsWith(`${key} (`)),
      }),
      {},
    ),
  );
  let chart: TrainingPlot = $state();
  run(() => {
    if (chart) {
      chart.destroy();
    }
    chart = trainingPlot(
      {
        $training: new BehaviorSubject<TrainingStatus>({ status: 'success', data: indexedLogs }),
      } as Model<Instance, unknown>,
      logSpec,
    );
    chart.mount(chartElt);
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy();
    }
  });
</script>

{#if logs.length > 0}
  <div bind:this={chartElt}></div>
{:else}
  <div class="empty">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="mcl-h-6 mcl-w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 7l4-4m0 0l4 4m-4-4v18"
      />
    </svg>
    <p>Select one or several runs to display information</p>
  </div>
{/if}

<style lang="postcss">
  .empty {
    margin: 2rem 0;
    color: grey;
    text-align: center;
  }
</style>
