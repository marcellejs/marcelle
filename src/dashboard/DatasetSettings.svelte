<script lang="ts">
  import type { Dataset } from '../modules/dataset';

  export let dataset: Dataset;

  $: count = dataset.$count;
  $: classes = dataset.$classes;

  function downloadDataset() {
    dataset.download();
  }

  function uploadDataset() {
    alert(`TODO: Upload ${dataset.title}`);
  }

  function clearDataset() {
    dataset.clear();
  }
</script>

<span class="card-title">{dataset.title}</span>
<p class="pb-2">
  {#if $count}
    This dataset contains
    {$count}
    instance{$count ? 's' : ''}
    from
    {Object.keys($classes).length}
    classe{Object.keys($classes).length ? 's' : ''}.
  {:else}This dataset is empty{/if}
</p>
<div class="flex">
  {#if $count}<button class="btn" on:click={downloadDataset}>Download Dataset</button>{/if}
  <button class="btn" on:click={uploadDataset}>Upload Dataset</button>
  <button class="btn danger" on:click={clearDataset}>Clear Dataset</button>
</div>
