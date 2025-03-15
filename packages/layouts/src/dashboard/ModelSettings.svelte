<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Instance, Model } from '@marcellejs/core';
  import { throwError } from '@marcellejs/core';
  import ViewContainer from './ViewContainer.svelte';

  interface Props {
    model: Model<Instance, unknown>;
  }

  let { model }: Props = $props();

  let uploadInput: HTMLInputElement = $state();

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

<ViewContainer title={model.title}>
  <div class="mly:flex">
    <button class="mly:btn mly:btn-outline" onclick={downloadModel}>Download Model</button>
    <span class="mly:w-1"></span>
    <input bind:this={uploadInput} type="file" multiple class="mly:hidden" />
    <button class="mly:btn mly:btn-outline" onclick={uploadModel}>Upload Model</button>
  </div>
</ViewContainer>
