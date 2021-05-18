<script lang="ts">
  import type { Stream } from '../../core';

  export let options: Stream<string[]>;
  export let value: Stream<string>;
</script>

<style type="text/postcss">
  .select-container {
    @apply inline-block relative w-64;
  }

  .select {
    @apply block appearance-none w-full bg-white border border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight;
  }

  .select:hover {
    @apply border-gray-500;
  }

  .select:focus {
    @apply outline-none ring;
  }
</style>

<div class="select-container">
  <select class="select" bind:value={$value}>
    {#each $options as option}
      <option>{option}</option>
    {/each}
  </select>
  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path
        d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
  </div>
</div>
