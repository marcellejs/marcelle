<script lang="ts">
  import { onMount, tick } from 'svelte';
  import type { Subject } from 'rxjs';

  interface Props {
    fileStream: Subject<File[]>;
  }

  let { fileStream }: Props = $props();

  let uploadInput: HTMLInputElement = $state();

  let counter = 0;
  let draggedOver = $state(false);

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
      files.push(f.item(i));
    }
    fileStream.next(files);
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

{#if draggedOver}
  <div class="overlay">
    <i>
      <svg
        class="mgui-mb-3 mgui-h-12 mgui-w-12 mgui-fill-current mgui-text-blue-700"
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
    <p class="mgui-text-lg mgui-text-blue-700">Drop files to upload</p>
  </div>
{/if}

<div
  ondragenter={handleDragEnter}
  ondragleave={handleDragLeave}
  ondragover={handleDragOver}
  ondrop={handleDragDrop}
  class="file-upload"
  role="none"
>
  <div
    class="mgui-flex mgui-flex-col mgui-items-center mgui-justify-center mgui-border-2 mgui-border-dashed mgui-border-gray-300 mgui-py-8"
  >
    <p
      class="mgui-mb-3 mgui-flex mgui-flex-wrap mgui-justify-center mgui-font-semibold mgui-text-gray-900"
    >
      <span>Drop Files here or:</span>
    </p>
    <input bind:this={uploadInput} type="file" multiple class="mgui-hidden" />
    <button class="mgui-btn" onclick={clickUpload}>Upload a file</button>
  </div>
</div>

<style lang="postcss">
  .file-upload {
    @apply mgui-mt-2;
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .overlay {
    @apply mgui-pointer-events-none mgui-absolute mgui-left-0 mgui-top-0 mgui-z-50 mgui-flex mgui-h-full mgui-w-full mgui-flex-col mgui-items-center mgui-justify-center mgui-rounded-md;
    background-color: rgba(255, 255, 255, 0.7);
  }
</style>
