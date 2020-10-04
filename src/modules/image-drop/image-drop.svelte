<script>
  import { resolveScalarsInLogs } from '@tensorflow/tfjs-layers/dist/logs';

  import ModuleBase from '../../core/ModuleBase.svelte';
  import { convertURIToImageData } from '../../utils/image';

  export let title;
  export let images;
  export let thumbnails;

  let counter = 0;
  let draggedOver = false;

  function handleDragEnter(e) {
    e.preventDefault();
    if (!hasFiles(e)) {
      return;
    }
    counter += 1;
    draggedOver = true;
  }

  function handleDragLeave(e) {
    counter -= 1;
    if (counter < 1) {
      draggedOver = false;
    }
  }

  function handleDragOver(e) {
    if (hasFiles(e)) {
      e.preventDefault();
    }
  }

  let objectURLs = [];
  function handleDragDrop(e) {
    e.preventDefault();
    objectURLs = [];
    const files = [];
    for (const file of e.dataTransfer.files) {
      const isImage = file.type.match('image.*');
      if (isImage) {
        objectURLs.push(URL.createObjectURL(file));
        files.push(file);
      }
      draggedOver = false;
      counter = 0;
    }
    objectURLs.forEach((imgUrl, i) => {
      Promise.all([convertURIToImageData(imgUrl), getDataUrl(files[i])]).then(
        ([img, thumbnail]) => {
          images.set(img);
          thumbnails.set(thumbnail);
        },
      );
    });
  }

  async function getDataUrl(file) {
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

  // let unSub = noop;
  // onMount(async () => {
  //   await new Promise((resolve, reject) => {
  //     const rej = setTimeout(() => {
  //       reject();
  //     }, 5000);
  //     const int = setInterval(() => {
  //       if (videoElement) {
  //         clearTimeout(rej);
  //         clearInterval(int);
  //         resolve();
  //       }
  //     }, 200);
  //   });
  //   unSub = mediaStream.subscribe((s) => {
  //     if (s) {
  //       videoElement.srcObject = s;
  //     }
  //   });
  // });

  // onDestroy(() => {
  //   unSub();
  // });

  // use to check if a file is being dragged
  const hasFiles = ({ dataTransfer: { types = [] } }) => types.indexOf('Files') > -1;
</script>

<style lang="postcss">
  .image-drop {
    @apply mt-2;
    width: 100%;
    display: flex;
    flex-direction: column;
    /* @apply h-full overflow-auto p-8 w-full h-full flex flex-col */
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
    class="image-drop">
    <div
      class="border-dashed border-2 border-gray-400 py-8 flex flex-col justify-center items-center">
      <p class="mb-3 font-semibold text-gray-900 flex flex-wrap justify-center">
        <span>Drag and drop an image or</span>
      </p>
      <input id="hidden-input" type="file" multiple class="hidden" />
      <button
        id="button"
        class="mt-2 rounded-sm px-3 py-1 bg-gray-200 hover:bg-gray-300 focus:shadow-outline
        focus:outline-none">
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
