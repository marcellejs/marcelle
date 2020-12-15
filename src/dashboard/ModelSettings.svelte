<script lang="ts">
  import { Model } from '../core';
  import { throwError } from '../utils/error-handling';

  export let model: Model;

  type SaveableModel = Model & { download(): void };

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
    alert(`TODO: Upload ${model.title}`);
  }
</script>

<span class="card-title">{model.title}</span>
<div class="flex">
  <button class="btn" on:click={downloadModel}>Download Model</button>
  <button class="btn" on:click={uploadModel}>Upload Model</button>
</div>
