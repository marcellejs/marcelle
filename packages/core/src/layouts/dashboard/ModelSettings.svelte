<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Instance, Model } from '../../core';
  import { throwError } from '../../utils/error-handling';

  export let model: Model<Instance, unknown>;

  let uploadInput: HTMLInputElement;

  type SaveableModel = Model<Instance, unknown> & {
    download(): void;
    upload(...files: File[]): Promise<void>;
  };

  function isSaveable(m: Model<Instance, unknown>): m is SaveableModel {
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
        files.push(fl.item(i));
      }
      if (isSaveable(model)) {
        model.upload(...files);
      }
    });
  });
</script>

<span class="card-title">{model.title}</span>
<div class="flex">
  <button class="btn btn-outline" on:click={downloadModel}>Download Model</button>
  <span class="w-1" />
  <input bind:this={uploadInput} type="file" multiple class="hidden" />
  <button class="btn btn-outline" on:click={uploadModel}>Upload Model</button>
</div>
