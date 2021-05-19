<script lang="ts">
  export let options: string[];
  export let value: string;

</script>

<div class="select-container">
  <select bind:value>
    {#each options as option}
      <option>{option}</option>
    {/each}
  </select>
  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
    <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
    </svg>
  </div>
</div>

<style type="text/postcss">
  .select-container {
    @apply inline-block relative w-full;
  }

  select {
    font-size: 100%;
    line-height: 1.15;
    margin: 0;
    box-sizing: border-box;
    @apply block appearance-none text-xs text-gray-700 w-full bg-white border-solid border border-gray-300 px-4 py-2 pr-8 rounded leading-tight cursor-pointer;
    transition: all 0.15s ease;
  }

  select:hover {
    @apply border-gray-400;
  }

  select:focus {
    @apply outline-none ring-blue-400 ring-2 ring-opacity-50;
  }

  select:active {
    @apply ring-blue-400 ring-4 ring-opacity-50;
  }

  option {
    background-color: white;
  }

</style>
