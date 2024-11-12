<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Dataset, Instance } from '@marcellejs/core';
  import ViewContainer from './ViewContainer.svelte';

  interface Props {
    dataset: Dataset<Instance>;
  }

  let { dataset }: Props = $props();

  let uploadInput: HTMLInputElement = $state();

  let count = $derived(dataset.$count);

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

<ViewContainer title={dataset.title}>
  <p class="mly-pb-2">
    {#if $count}
      This dataset contains {$count} instance{$count ? 's' : ''}.
    {:else}
      This dataset is empty
    {/if}
  </p>
  <div class="mly-flex">
    {#if $count}
      <button class="mly-btn mly-btn-outline" onclick={downloadDataset}> Download Dataset </button>
      <span class="mly-w-1"></span>
    {/if}
    <button class="mly-btn mly-btn-outline" onclick={uploadDataset}> Upload Dataset </button>
    <span class="mly-w-1"></span>
    <input bind:this={uploadInput} type="file" multiple class="mly-hidden" />
    <button class="mly-btn mly-btn-outline mly-btn-error" onclick={clearDataset}>
      Clear Dataset
    </button>
  </div>
</ViewContainer>
