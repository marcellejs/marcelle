<script>
  export let title;
  export let capturing;
  export let label;

  function startCapture() {
    capturing.set(true);
  }

  function stopCapture() {
    capturing.set(false);
  }
</script>

<span class="card-title">{title}</span>

<svelte:body on:mouseup={$capturing && stopCapture} />

<div class="w-full max-w-sm mt-8">
  <div class="md:flex md:items-center mb-2">
    <input
      class="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4
      text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
      id="inline-label"
      type="text"
      placeholder="Enter a label.."
      bind:value={$label} />
  </div>
  <div class="md:flex md:items-center">
    <button class="w-full" on:mousedown={startCapture}>{$capturing ? 'Stop' : 'Capture'}</button>
  </div>
</div>
