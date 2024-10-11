<script lang="ts">
  import { afterUpdate } from 'svelte';
  import type { DashboardSettings } from './dashboard_settings';
  import DatasetSettings from './DatasetSettings.svelte';
  import DataStoreSettings from './DataStoreSettings.svelte';
  import ModelSettings from './ModelSettings.svelte';
  import PredictionsSettings from './PredictionsSettings.svelte';

  export let settings: DashboardSettings;

  afterUpdate(() => {
    settings.mount();
  });
</script>

{#if settings}
  <div class="left">
    <h2 class="text-2xl font-bold">Data Stores</h2>
    {#each settings.xDataStores as dataStore}
      <DataStoreSettings {dataStore} />
    {/each}
    <h2 class="text-2xl font-bold">Models</h2>
    {#each settings.xModels as model}
      <ModelSettings {model} />
    {/each}
    <h2 class="text-2xl font-bold">Datasets</h2>
    {#each settings.xDatasets as dataset}
      <DatasetSettings {dataset} />
    {/each}
    <h2 class="text-2xl font-bold">Predictions</h2>
    {#each settings.xPredictions as prediction}
      <PredictionsSettings {prediction} />
    {/each}
  </div>
  <div class="right">
    {#each settings.components as m}
      {#if Array.isArray(m)}
        <div class="flex flex-row flex-wrap items-stretch">
          {#each m as { id }}
            <div {id} class="card flex-none xl:flex-1 w-full xl:w-auto" />
          {/each}
        </div>
      {:else if typeof m === 'string'}
        <h2>{m}</h2>
      {:else}
        <div id={m.id} class="card" />
      {/if}
    {/each}
  </div>
{/if}

<style type="text/postcss">
  .left {
    @apply shrink-0 p-1 w-full;
  }

  .right {
    @apply grow p-1;
  }

  @screen lg {
    .left {
      width: 50%;
    }

    .right {
      width: 50%;
      /* max-width: calc(100% - 350px); */
    }
  }
</style>
