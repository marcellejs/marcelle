<script lang="ts">
  import type { Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title: string;
  export let size: number;
  export let frames: Stream<number[]>;
</script>

<ModuleBase {title}>
  <p>size: {size}</p>
  {#if $frames}
    <p>values: [{$frames.map((x) => x.toFixed(2)).join(' ; ')}]</p>
  {/if}
</ModuleBase>
