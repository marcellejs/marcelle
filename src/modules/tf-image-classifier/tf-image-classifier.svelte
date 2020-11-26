<script>
  import { createEventDispatcher } from 'svelte';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title;
  export let loading;
  export let modelFiles;

  let files;
  const dispatch = createEventDispatcher();

  function saveModel() {
    dispatch('save');
  }

  function uploadModel() {
    const fileUps = document.getElementById('fileUpload');
    fileUps.addEventListener('change', handleFiles, false);
    if (fileUps) {
      fileUps.click();
    }
  }

  async function handleFiles() {
    const filesArray = [];
    for (let i = 0; i < this.files.length; i++) {
      filesArray.push(this.files[i]);
    }
    if (this.files.length) {
      const jsonFiles = filesArray.filter((x) => x.name.includes('.json')).map((x) => x);
      const weightsFiles = filesArray.filter((x) => x.name.includes('.bin')).map((x) => x);
      if (this.files.length !== 2 || jsonFiles.length !== 1 || weightsFiles.length !== 1) {
        throw new Error('Two files must be submitted (.json and .weights.bin)');
      }
      modelFiles.set([jsonFiles[0], weightsFiles[0]]);
    }
  }
</script>

<ModuleBase {title} loading={$loading}>
  <!-- <ModuleBase {title}> -->
  <div style="display:inline-block;">
    <input type="file" id="fileUpload" multiple style="display:none" />
    <button
      id="fileSelect"
      class="mt-2 rounded-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:ring
        focus:outline-none"
      style="width:200px; "
      on:click={uploadModel}>Upload Model</button>

    <button
      id="saveModel"
      class="mt-2 rounded-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:ring
        focus:outline-none"
      style="width:200px; "
      on:click={saveModel}>Save Model</button>
    <span style="color:#999999;">Upload model requires two files (a
      <em>.json</em>
      for the model and
      <em>.bin</em>
      for the weights)</span>
  </div>
</ModuleBase>
