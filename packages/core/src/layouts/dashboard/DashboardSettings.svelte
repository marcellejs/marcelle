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
    <h2>Data Stores</h2>
    {#each settings.xDataStores as dataStore}
      <div class="card">
        <DataStoreSettings {dataStore} />
      </div>
    {/each}
    <h2>Models</h2>
    {#each settings.xModels as model}
      <div class="card">
        <ModelSettings {model} />
      </div>
    {/each}
    <h2>Datasets</h2>
    {#each settings.xDatasets as dataset}
      <div class="card">
        <DatasetSettings {dataset} />
      </div>
    {/each}
    <h2>Predictions</h2>
    {#each settings.xPredictions as prediction}
      <div class="card">
        <PredictionsSettings {prediction} />
      </div>
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
