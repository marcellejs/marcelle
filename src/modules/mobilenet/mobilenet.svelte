<script>
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title;
  export let loading;
  export let version;
  export let alpha;
</script>

<ModuleBase {title} loading={$loading}>
  <p class="p-2 text-sm text-gray-600">
    {#if $loading}&nbsp;{:else}Using Mobilenet v{version} with alpha = {alpha}.{/if}
  </p>
</ModuleBase>
