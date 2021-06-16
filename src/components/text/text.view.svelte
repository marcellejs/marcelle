<script lang="ts">
  import type { Stream } from '../../core';
  import ViewContainer from '../../core/ViewContainer.svelte';

  export let title: string;
  export let text: Stream<string>;
</script>

<svelte:options accessors />

<ViewContainer {title}>
  <div class="flex-grow flex">
    {#if $text}
      {@html $text}
    {/if}
  </div>
</ViewContainer>
