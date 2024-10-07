<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Dataset, Instance } from '../../core';

  export let dataset: Dataset<Instance>;

  let uploadInput: HTMLInputElement;

  $: count = dataset.$count;

  function downloadDataset() {
    dataset.download();
  }

  function uploadDataset() {
    uploadInput?.click();
  }

  function clearDataset() {
    dataset.clear();
  }

  onMount(async () => {
    await tick();
    await tick();
    uploadInput.addEventListener('change', (e) => {
      const fl = (e.target as HTMLInputElement).files;
      const files: File[] = [];
      for (let i = 0; i < fl.length; i++) {
        files.push(fl.item(i));
      }
      dataset.upload(files);
    });
  });
</script>

<span class="card-title">{dataset.title}</span>
<p class="pb-2">
  {#if $count}
    This dataset contains {$count} instance{$count ? 's' : ''}.
  {:else}
    This dataset is empty
  {/if}
</p>
<div class="flex">
  {#if $count}
    <button class="btn btn-outline" on:click={downloadDataset}> Download Dataset </button>
    <span class="w-1" />
  {/if}
  <button class="btn btn-outline" on:click={uploadDataset}> Upload Dataset </button>
  <span class="w-1" />
  <input bind:this={uploadInput} type="file" multiple class="hidden" />
  <button class="btn btn-outline btn-error" on:click={clearDataset}> Clear Dataset </button>
</div>
