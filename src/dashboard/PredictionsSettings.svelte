<script lang="ts">
  import type { BatchPrediction } from '../modules/batch-prediction';

  export let prediction: BatchPrediction;

  $: count = prediction.$count;
  $: console.log('prediction', prediction);

  function downloadPredictions() {
    alert(`TODO: Download ${prediction.title}`);
    // prediction.download();
  }

  function uploadPredictions() {
    alert(`TODO: Upload ${prediction.title}`);
  }

  function clearPredictions() {
    prediction.clear();
  }
</script>

<span class="card-title">{prediction.title}</span>
<p class="pb-2">
  {#if $count}
    This batch prediction module contains
    {$count}
    prediction{$count ? 's' : ''}
  {:else}This batch prediction module is empty{/if}
</p>
<div class="flex">
  {#if $count}<button class="btn" on:click={downloadPredictions}>Download Predictions</button>{/if}
  <button class="btn" on:click={uploadPredictions}>Upload Predictions</button>
  <button class="btn danger" on:click={clearPredictions}>Clear Predictions</button>
</div>
