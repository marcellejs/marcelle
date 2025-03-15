<script lang="ts">
  import type { DashboardSettings } from './dashboard_settings';
  import DatasetSettings from './DatasetSettings.svelte';
  import DataStoreSettings from './DataStoreSettings.svelte';
  import ModelSettings from './ModelSettings.svelte';
  import PredictionsSettings from './PredictionsSettings.svelte';

  interface Props {
    settings: DashboardSettings;
  }

  let { settings }: Props = $props();

  $effect(() => {
    settings.mount();
  });
</script>

{#if settings}
  <div class="mly:w-full mly:shrink-0 mly:p-1 mly:lg:w-1/2">
    <h2 class="mly:text-2xl mly:font-bold">Data Stores</h2>
    {#each settings.xDataStores as dataStore, i (i)}
      <DataStoreSettings {dataStore} />
    {/each}
    <h2 class="mly:text-2xl mly:font-bold">Models</h2>
    {#each settings.xModels as model, i (i)}
      <ModelSettings {model} />
    {/each}
    <h2 class="mly:text-2xl mly:font-bold">Datasets</h2>
    {#each settings.xDatasets as dataset, i (i)}
      <DatasetSettings {dataset} />
    {/each}
    <h2 class="mly:text-2xl mly:font-bold">Predictions</h2>
    {#each settings.xPredictions as prediction, i (i)}
      <PredictionsSettings {prediction} />
    {/each}
  </div>
  <div class="mly:grow mly:p-1 mly:lg:w-1/2">
    {#each settings.components as m, i (i)}
      {#if Array.isArray(m)}
        <div class="mly:flex mly:flex-row mly:flex-wrap mly:items-stretch">
          {#each m as { id }, j (j)}
            <div {id} class="mly:card mly:w-full mly:flex-none mly:xl:w-auto mly:xl:flex-1"></div>
          {/each}
        </div>
      {:else if typeof m === 'string'}
        <h2>{m}</h2>
      {:else}
        <div id={m.id} class="mly:card"></div>
      {/if}
    {/each}
  </div>
{/if}
