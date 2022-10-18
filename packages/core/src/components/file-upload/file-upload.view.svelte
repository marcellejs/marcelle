<script lang="ts">
  import { onMount, tick } from 'svelte';

  import type { Stream } from '../../core';
  import { ViewContainer } from '@marcellejs/design-system';
  import { Button } from '@marcellejs/design-system';

  export let title: string;
  export let fileStream: Stream<File[]>;

  let uploadInput: HTMLInputElement;

  let counter = 0;
  let draggedOver = false;

  // use to check if a file is being dragged
  const hasFiles = ({ dataTransfer: { types = [] } }: DragEvent) => types.indexOf('Files') > -1;

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    if (!hasFiles(e)) {
      return;
    }
    counter += 1;
    draggedOver = true;
  }

  function handleDragLeave() {
    counter -= 1;
    if (counter < 1) {
      draggedOver = false;
    }
  }

  function handleDragOver(e: DragEvent) {
    if (hasFiles(e)) {
      e.preventDefault();
    }
  }

  function processFiles(f: FileList) {
    const files: File[] = [];
    for (let i = 0; i < f.length; i++) {
      files.push(f[i]);
    }
    fileStream.set(files);
  }

  function handleDragDrop(e: DragEvent) {
    e.preventDefault();
    draggedOver = false;
    processFiles(e.dataTransfer.files);
  }

  onMount(async () => {
    await tick();
    await tick();
    uploadInput.addEventListener('change', (e) => {
      processFiles((e.target as HTMLInputElement).files);
    });
  });

  function clickUpload() {
    if (uploadInput) {
      uploadInput.click();
    }
  }
</script>

<ViewContainer {title}>
  {#if draggedOver}
    <div class="overlay">
      <i>
        <svg
          class="fill-current w-12 h-12 mb-3 text-blue-700"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            d="M19.479 10.092c-.212-3.951-3.473-7.092-7.479-7.092-4.005 0-7.267 3.141-7.479 7.092-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h13c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408zm-7.479-1.092l4 4h-3v4h-2v-4h-3l4-4z"
          />
        </svg>
      </i>
      <p class="text-lg text-blue-700">Drop files to upload</p>
    </div>
  {/if}

  <div
    on:dragenter={handleDragEnter}
    on:dragleave={handleDragLeave}
    on:dragover={handleDragOver}
    on:drop={handleDragDrop}
    class="file-upload"
  >
    <div
      class="border-dashed border-2 border-gray-300 py-8 flex flex-col justify-center items-center"
    >
      <p class="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
        <span>Drop Files here or:</span>
      </p>
      <input bind:this={uploadInput} type="file" multiple class="hidden" />
      <Button on:click={clickUpload}>Upload a file</Button>
    </div>
  </div>
</ViewContainer>

<style lang="postcss">
  .file-upload {
    @apply mt-2;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .overlay {
    @apply w-full h-full absolute top-0 left-0 pointer-events-none z-50 flex flex-col items-center
      justify-center rounded-md;
    background-color: rgba(255, 255, 255, 0.7);
  }
</style>
