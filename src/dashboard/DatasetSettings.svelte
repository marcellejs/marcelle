<script>
  export let dataset;
  export let count;
  export let classes;

  function downloadDataset() {
    dataset.download();
  }

  function uploadDataset() {
    alert(`TODO: Upload ${dataset.name}`);
  }

  function clearDataset() {
    dataset.clear();
  }
</script>

<div class="card">
  <span class="card-title">{dataset.name}</span>
  {#if $count}
    <p>
      This dataset contains {$count} instance{$count ? 's' : ''} from {Object.keys($classes).length}
      classe{Object.keys($classes).length ? 's' : ''}.
    </p>
    <button class="btn" on:click={downloadDataset}>Download Dataset</button>
  {:else}
    <p>This dataset is empty</p>
  {/if}
  <button class="btn" on:click={uploadDataset}>Upload Dataset</button>
  <button class="btn danger" on:click={clearDataset}>Clear Dataset</button>
</div>
