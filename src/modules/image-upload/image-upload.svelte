<script lang="ts">
  import { onMount, tick } from 'svelte';

  import type { Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';
  import { convertURIToImageData } from '../../utils/image';

  export let title: string;
  export let images: Stream<ImageData>;
  export let thumbnails: Stream<string>;

  let uploadInput: HTMLInputElement;

  let counter = 0;
  let draggedOver = false;

  function handleDragEnter(e: DragEvent) {
    e.preventDefault();
    if (!hasFiles(e)) {
      return;
    }
    counter += 1;
    draggedOver = true;
  }

  function handleDragLeave(e: DragEvent) {
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

  let objectURLs: string[] = [];
  function handleDragDrop(e: DragEvent) {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  }

  function processFiles(f: FileList) {
    objectURLs = [];
    const files: File[] = [];
    for (let i = 0; i < f.length; i++) {
      const file = f[i];
      const isImage = file.type.match('image.*');
      if (isImage) {
        objectURLs.push(URL.createObjectURL(file));
        files.push(file);
      }
      draggedOver = false;
      counter = 0;
    }
    objectURLs.forEach((imgUrl: string, i: number) => {
      Promise.all([convertURIToImageData(imgUrl), getDataUrl(files[i])]).then(
        ([img, thumbnail]) => {
          images.set(img);
          thumbnails.set(thumbnail as string);
        },
      );
    });
  }

  async function getDataUrl(file: File) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener(
        'load',
        () => {
          resolve(reader.result);
        },
        false,
      );

      if (file) {
        reader.readAsDataURL(file);
      } else {
        reject();
      }
    });
  }

  // use to check if a file is being dragged
  const hasFiles = ({ dataTransfer: { types = [] } }: DragEvent) => types.indexOf('Files') > -1;

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

<style lang="postcss">
  .image-upload {
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

<ModuleBase {title}>
  {#if draggedOver}
    <div class="overlay">
      <i>
        <svg
          class="fill-current w-12 h-12 mb-3 text-blue-700"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24">
          <path
            d="M19.479 10.092c-.212-3.951-3.473-7.092-7.479-7.092-4.005 0-7.267 3.141-7.479 7.092-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h13c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408zm-7.479-1.092l4 4h-3v4h-2v-4h-3l4-4z" />
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
    class="image-upload">
    <div
      class="border-dashed border-2 border-gray-400 py-8 flex flex-col justify-center items-center">
      <p class="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
        <span>Drag and drop an image or</span>
      </p>
      <input bind:this={uploadInput} type="file" multiple class="hidden" />
      <button
        id="button"
        class="mt-2 rounded-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:ring
        focus:outline-none"
        on:click={clickUpload}>
        Upload a file
      </button>
    </div>

    <div class="flex flex-wrap">
      {#each objectURLs as src}
        <img
          class="mx-auto my-2 w-32"
          src={src || 'https://user-images.githubusercontent.com/507615/54591670-ac0a0180-4a65-11e9-846c-e55ffce0fe7b.png'}
          alt="no data" />
      {/each}
    </div>
  </div>
</ModuleBase>
