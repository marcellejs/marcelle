<script lang="ts">
  import { onMount, tick } from 'svelte';

  import type { Dataset } from '../modules/dataset';

  export let dataset: Dataset;

  let uploadInput: HTMLInputElement;

  $: count = dataset.$count;
  $: classes = dataset.$classes;

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
        files.push(fl[i]);
      }
      dataset.upload(files);
    });
  });
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
  <input bind:this={uploadInput} type="file" multiple class="hidden" />
  <button class="btn danger" on:click={clearDataset}>Clear Dataset</button>
</div>
