<script>
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title;
  export let size;
  export let frames;
</script>

<ModuleBase {title}>
  <p>size: {size}</p>
  {#if $frames}
    <p>values: [{$frames.map((x) => x.toFixed(2)).join(' ; ')}]</p>
  {/if}
</ModuleBase>
