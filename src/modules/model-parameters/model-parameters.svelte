<svelte:options accessors />

<script lang="ts">
  import Number from './Number.svelte';
  import NumberArray from './NumberArray.svelte';
  import ModuleBase from '../../core/ModuleBase.svelte';
  import type { Stream } from '../../core';

  export let title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let parameters: Record<string, Stream<any>>;
</script>

<ModuleBase {title}>
  <div class="m-2">
    {#each Object.entries(parameters) as [key, stream]}
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
</ModuleBase>
