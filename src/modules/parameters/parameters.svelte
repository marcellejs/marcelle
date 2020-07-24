<script>
  import Number from './Number.svelte';
  import NumberArray from './NumberArray.svelte';

  export let title;
  export let parameters;
</script>

<svelte:options accessors />

<span class="card-title">{title}</span>

<div class="m-2">
  {#each Object.entries(parameters) as [key, stream], i}
    <div class="flex my-1">
      <p class="w-32">{key}</p>
      {#if typeof stream.value === 'number'}
        <Number value={stream} />
      {:else if Array.isArray(stream.value) && stream.value.length && typeof stream.value[0] === 'number'}
        <NumberArray values={stream} />
      {/if}
    </div>
  {/each}
</div>
