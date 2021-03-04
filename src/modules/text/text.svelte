<script lang="ts">
  import type { Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title: string;
  export let text: Stream<string>;
</script>

<svelte:options accessors />

<ModuleBase {title}>
  <div class="flex-grow flex">
    {#if $text}
      {@html $text}
    {/if}
  </div>
</ModuleBase>
