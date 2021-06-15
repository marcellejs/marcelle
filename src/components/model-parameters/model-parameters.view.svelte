<svelte:options accessors />

<script lang="ts">
  import Number from '../../ui/components/Number.svelte';
  import NumberArray from '../../ui/components/NumberArray.svelte';
  import ViewContainer from '../../core/ViewContainer.svelte';
  import type { Stream } from '../../core';

  export let title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let parameters: Record<string, Stream<any>>;

</script>

<ViewContainer {title}>
  <div class="m-2">
    {#each Object.entries(parameters) as [key, stream]}
      <div class="flex my-1 items-center">
        <p class="w-32 my-2">{key}</p>
        {#if typeof stream.value === 'number'}
          <Number {stream} />
        {:else if Array.isArray(stream.value) && stream.value.length && typeof stream.value[0] === 'number'}
          <NumberArray {stream} />
        {/if}
      </div>
    {/each}
  </div>
</ViewContainer>
