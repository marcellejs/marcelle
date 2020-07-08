<script>
  import { onMount } from 'svelte';
  export let dashboard = undefined;

  onMount(() => {
    dashboard.mount();
  });
</script>

<style type="text/postcss">
  .left {
    @apply flex-shrink-0 p-1;
    width: 350px;
  }

  .right {
    @apply flex-grow p-1;
  }
</style>

{#if dashboard}
  <div class="left">
    {#each dashboard.modulesLeft as { id }}
      <div {id} class="card" />
    {/each}
  </div>
  <div class="right">
    {#each dashboard.modules as { id }}
      <div {id} class="card" />
    {/each}
  </div>
{/if}
