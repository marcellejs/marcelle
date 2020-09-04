<script>
  import { afterUpdate } from 'svelte';

  export let dashboard;

  afterUpdate(() => {
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
    {#each dashboard.modules as m}
      {#if Array.isArray(m)}
        <div class="flex flex-row flex-wrap items-stretch">
          {#each m as { id }}
            <div {id} class="card flex-grow" />
          {/each}
        </div>
      {:else if typeof m === 'string'}
        <h2>{m}</h2>
      {:else}
        <div id={m.id} class="card" />
      {/if}
    {/each}
  </div>
{/if}
