<script lang="ts">
  import type { Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title: string;
  export let loading: Stream<boolean>;
  export let base: string;
</script>

<ModuleBase {title} loading={$loading}>
  <p class="p-2 text-sm text-gray-600">
    {#if $loading}&nbsp;{:else}COCO-SSD loaded with base {base}{/if}
  </p>
</ModuleBase>
