<script lang="ts">
  import type { BatchPrediction } from '@marcellejs/core';
  import { map } from 'rxjs';
  import ViewContainer from './ViewContainer.svelte';

  export let prediction: BatchPrediction;

  // let uploadInput: HTMLInputElement;

  $: count = prediction.$status.pipe(map((x) => x.count || 0));

  function clearPredictions() {
    prediction.clear();
  }

  // onMount(async () => {
  //   await tick();
  //   await tick();
  //   uploadInput.addEventListener('change', (e) => {
  //     const fl = (e.target as HTMLInputElement).files;
  //     const files: File[] = [];
  //     for (let i = 0; i < fl.length; i++) {
  //       files.push(fl.item(i));
  //     }
  //     // prediction.upload(files);
  //   });
  // });
</script>

<ViewContainer title={prediction.title}>
  <p class="pb-2">
    {#if $count}
      This batch prediction component contains
      {$count}
      prediction{$count ? 's' : ''}
    {:else}This batch prediction component is empty{/if}
  </p>
  <div class="flex">
    <!-- {#if $count}
    <button on:click={downloadPredictions}>Download Predictions</button>
    <span class="w-1" />
  {/if}
  <button on:click={uploadPredictions}>Upload Predictions</button> -->
    <!-- <span class="w-1" />
  <input bind:this={uploadInput} type="file" multiple class="hidden" /> -->
    <button class="mly-btn mly-btn-outline mly-btn-error" on:click={clearPredictions}
      >Clear Predictions</button
    >
  </div>
</ViewContainer>
