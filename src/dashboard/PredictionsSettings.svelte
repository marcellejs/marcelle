<script lang="ts">
  import { onMount, tick } from 'svelte';

  import type { BatchPrediction } from '../modules/batch-prediction';

  export let prediction: BatchPrediction;

  let uploadInput: HTMLInputElement;

  $: count = prediction.$count;

  function downloadPredictions() {
    prediction.download();
  }

  function uploadPredictions() {
    uploadInput?.click();
  }

  function clearPredictions() {
    prediction.clear();
  }

  onMount(async () => {
    await tick();
    await tick();
    uploadInput.addEventListener('change', (e) => {
      const fl = (e.target as HTMLInputElement).files;
      const files: File[] = [];
      for (let i = 0; i < fl.length; i++) {
        files.push(fl[i]);
      }
      prediction.upload(files);
    });
  });
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
  <input bind:this={uploadInput} type="file" multiple class="hidden" />
  <button class="btn danger" on:click={clearPredictions}>Clear Predictions</button>
</div>
