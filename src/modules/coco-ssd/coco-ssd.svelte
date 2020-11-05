<script>
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title;
  export let loading;
  export let base;
</script>

<ModuleBase {title} loading={$loading}>
  <p class="p-2 text-sm text-gray-600">
    {#if $loading}&nbsp;{:else}COCO-SSD loaded with base {base}{/if}
  </p>
</ModuleBase>
