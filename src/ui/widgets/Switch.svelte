<script>
  export let text = '';
  export let checked = false;
  export let disabled = false;
</script>

<style type="text/postcss">
  .switch {
    @apply relative inline-block align-middle cursor-pointer select-none bg-transparent;
  }

  .track {
    @apply relative inline-block w-10 h-5 bg-gray-600 rounded-full shadow-inner;
  }

  .thumb {
    @apply inline-block transition-all duration-300 ease-in-out absolute top-0 left-0 w-5 h-5 bg-white border-2 border-gray-600 rounded-full;
  }

  input[type='checkbox']:checked ~ .thumb {
    @apply transform translate-x-full border-green-500;
  }

  input[type='checkbox']:checked ~ .track {
    @apply transform transition-colors bg-green-500;
  }

  input[type='checkbox']:disabled ~ .track {
    @apply bg-gray-500 cursor-default;
  }
  input[type='checkbox']:disabled:active + .track {
    @apply shadow-none;
  }

  input[type='checkbox']:disabled ~ .thumb {
    @apply bg-gray-100 border-gray-500;
  }

  input[type='checkbox']:focus + .track,
  input[type='checkbox']:active + .track {
    @apply shadow-outline;
  }
</style>

<label>
  <input type="checkbox" class="sr-only" {disabled} bind:checked />
  <span class="switch"> <span class="track" /> <span class="thumb" /> </span>
  <span class="ml-2 cursor-pointer">{text}</span>
</label>
