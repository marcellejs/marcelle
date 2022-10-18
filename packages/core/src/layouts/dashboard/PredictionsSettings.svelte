<script lang="ts">
  import { onMount, tick } from 'svelte';

  import type { BatchPrediction } from '../../components/batch-prediction';
  import { Button } from '@marcellejs/design-system';

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
    This batch prediction component contains
    {$count}
    prediction{$count ? 's' : ''}
  {:else}This batch prediction component is empty{/if}
</p>
<div class="flex">
  {#if $count}
    <Button on:click={downloadPredictions}>Download Predictions</Button>
    <span class="w-1" />
  {/if}
  <Button on:click={uploadPredictions}>Upload Predictions</Button>
  <span class="w-1" />
  <input bind:this={uploadInput} type="file" multiple class="hidden" />
  <Button type="danger" on:click={clearPredictions}>Clear Predictions</Button>
</div>
