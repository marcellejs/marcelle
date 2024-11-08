<script lang="ts">
  import { onMount, tick } from 'svelte';
  import loadImage from 'blueimp-load-image';
  import type { Subject } from 'rxjs';

  export let images: Subject<ImageData>;
  export let thumbnails: Subject<string>;
  export let width: number;
  export let height: number;

  let uploadInput: HTMLInputElement;

  let counter = 0;
  let draggedOver = false;
  let objectURLs: string[] = [];

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

  async function processImageFile(file: File) {
    const { image } = await loadImage(file, {
      ...(width > 0 && { maxWidth: width }),
      ...(height > 0 && { maxHeight: height }),
      cover: true,
      crop: true,
      canvas: true,
      crossOrigin: 'Anonymous',
    });
    const { image: thumbnail } = await loadImage(file, {
      maxWidth: 60,
      maxHeight: 60,
      cover: true,
      crop: true,
      canvas: true,
      crossOrigin: 'Anonymous',
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const img = image as any as HTMLCanvasElement;
    const imgData = img
      .getContext('2d')
      .getImageData(0, 0, width || img.width, height || img.height);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const thumb = thumbnail as any as HTMLCanvasElement;
    const thumbData = thumb.toDataURL('image/jpeg');
    thumbnails.next(thumbData);
    images.next(imgData);
  }

  async function processFiles(f: FileList) {
    objectURLs = [];
    // const imgPromises = [];
    let p = Promise.resolve();
    for (let i = 0; i < f.length; i++) {
      const file = f.item(i);
      const isImage = file.type.match('image.*');
      if (isImage) {
        p = p.then(() => processImageFile(file));
      }
      draggedOver = false;
      counter = 0;
    }
    await p;
  }

  function handleDragDrop(e: DragEvent) {
    e.preventDefault();
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
  <div
    class="pointer-events-none absolute left-0 top-0 z-50 flex h-full w-full flex-col items-center
      justify-center rounded-md bg-base-100 opacity-90"
  >
    <i>
      <svg
        class="mb-3 h-12 w-12 fill-current text-accent"
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
    <p class="text-lg text-accent">Drop files to upload</p>
  </div>
{/if}

<div
  on:dragenter={handleDragEnter}
  on:dragleave={handleDragLeave}
  on:dragover={handleDragOver}
  on:drop={handleDragDrop}
  class="image-upload"
  role="none"
>
  <div
    class="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 py-8"
  >
    <p class="mb-3 flex flex-wrap justify-center font-semibold">
      <span>Drag and drop an image or</span>
    </p>
    <input bind:this={uploadInput} type="file" multiple class="hidden" />
    <button class="mgui-btn" on:click={clickUpload}>Upload a file</button>
  </div>

  <div class="flex flex-wrap">
    {#each objectURLs as src}
      <img
        class="mx-auto my-2 w-32"
        src={src ||
          'https://user-images.githubusercontent.com/507615/54591670-ac0a0180-4a65-11e9-846c-e55ffce0fe7b.png'}
        alt="no data"
      />
    {/each}
  </div>
</div>

<style lang="postcss">
  .image-upload {
    @apply mt-2;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
