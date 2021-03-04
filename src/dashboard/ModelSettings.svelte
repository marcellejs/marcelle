<script lang="ts">
  import { onMount, tick } from 'svelte';

  import { Model } from '../core';
  import { throwError } from '../utils/error-handling';

  export let model: Model;

  let uploadInput: HTMLInputElement;

  type SaveableModel = Model & {
    download(): void;
    upload(...files: File[]): Promise<void>;
  };

  function isSaveable(m: Model): m is SaveableModel {
    return 'download' in m;
  }

  function downloadModel() {
    if (isSaveable(model)) {
      model.download();
    } else {
      throwError(new Error('This model cannot be saved'));
    }
  }

  function uploadModel() {
    if (isSaveable(model)) {
      uploadInput?.click();
    } else {
      throwError(new Error('This model cannot be uploaded'));
    }
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
      if (isSaveable(model)) {
        model.upload(...files);
      }
    });
  });
</script>

<span class="card-title">{model.title}</span>
<div class="flex">
  <button class="btn" on:click={downloadModel}>Download Model</button>
  <input bind:this={uploadInput} type="file" multiple class="hidden" />
  <button class="btn" on:click={uploadModel}>Upload Model</button>
</div>
