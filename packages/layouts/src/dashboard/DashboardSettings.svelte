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
  <div class="left">
    <h2 class="mly-text-2xl mly-font-bold">Data Stores</h2>
    {#each settings.xDataStores as dataStore}
      <DataStoreSettings {dataStore} />
    {/each}
    <h2 class="mly-text-2xl mly-font-bold">Models</h2>
    {#each settings.xModels as model}
      <ModelSettings {model} />
    {/each}
    <h2 class="mly-text-2xl mly-font-bold">Datasets</h2>
    {#each settings.xDatasets as dataset}
      <DatasetSettings {dataset} />
    {/each}
    <h2 class="mly-text-2xl mly-font-bold">Predictions</h2>
    {#each settings.xPredictions as prediction}
      <PredictionsSettings {prediction} />
    {/each}
  </div>
  <div class="right">
    {#each settings.components as m}
      {#if Array.isArray(m)}
        <div class="mly-flex mly-flex-row mly-flex-wrap mly-items-stretch">
          {#each m as { id }}
            <div {id} class="mly-card mly-w-full mly-flex-none xl:mly-w-auto xl:mly-flex-1"></div>
          {/each}
        </div>
      {:else if typeof m === 'string'}
        <h2>{m}</h2>
      {:else}
        <div id={m.id} class="mly-card"></div>
      {/if}
    {/each}
  </div>
{/if}

<style type="text/postcss">
  .left {
    @apply mly-w-full mly-shrink-0 mly-p-1;
  }

  .right {
    @apply mly-grow mly-p-1;
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
