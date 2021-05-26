<script lang="ts">
  export let text = '';
  export let checked = false;
  export let disabled = false;

</script>

<label class="marcelle">
  <input type="checkbox" class="sr-only" {disabled} bind:checked />
  <span class="switch">
    <span class="track" />
    <span class="thumb" />
  </span>
  <span class="ml-2 cursor-pointer">{text}</span>
</label>

<style type="text/postcss">
  .switch {
    @apply relative inline-block align-middle cursor-pointer select-none bg-transparent;
  }

  .track {
    @apply relative inline-block w-8 h-4 bg-gray-300 rounded-full shadow-inner;
  }

  .thumb {
    @apply inline-block transition-all duration-300 ease-in-out absolute w-5 h-5 bg-white border-solid border border-gray-300 rounded-full;
    top: -0.125rem;
    left: -0.125rem;
  }

  input[type='checkbox']:checked ~ .switch .thumb {
    @apply transform border-blue-500;
    --tw-translate-x: calc(100% - 0.25rem);
  }

  input[type='checkbox']:checked ~ .switch .track {
    @apply transform transition-colors bg-blue-500;
  }

  input[type='checkbox']:disabled ~ .switch .track {
    @apply bg-gray-500 cursor-default;
  }
  input[type='checkbox']:disabled:active + .switch .track {
    @apply shadow-none;
  }

  input[type='checkbox']:disabled ~ .switch .thumb {
    @apply bg-gray-100 border-gray-500;
  }

  input[type='checkbox']:focus + .switch .track,
  input[type='checkbox']:active + .switch .track {
    @apply ring;
  }

</style>
