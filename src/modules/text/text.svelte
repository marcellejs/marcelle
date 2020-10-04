<script>
  import ModuleBase from '../../core/ModuleBase.svelte';

  export let title;
  export let text;
</script>

<svelte:options accessors />

<ModuleBase {title}>
  <div>
    {#if $text}
      {@html $text}
    {/if}
  </div>
</ModuleBase>
