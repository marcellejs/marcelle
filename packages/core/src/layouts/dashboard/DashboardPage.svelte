<script lang="ts">
  import { afterUpdate } from 'svelte';
  import type { DashboardPage } from './dashboard_page';
  import ViewContainer from './ViewContainer.svelte';

  export let dashboard: DashboardPage;

  afterUpdate(() => {
    dashboard.mount();
  });
</script>

{#if dashboard}
  {#if dashboard.showSidebar}
    <div class="left">
      {#each dashboard.componentsLeft as { id, title, $loading: loading }}
        <ViewContainer {title} {loading}>
          <div {id} />
        </ViewContainer>
      {/each}
    </div>
  {/if}
  <div class="right" class:fullw={!dashboard.showSidebar}>
    {#each dashboard.components as m}
      {#if Array.isArray(m)}
        <div class="flex flex-row flex-wrap items-stretch gap-1">
          {#each m as { id, title, $loading: loading }}
            <!-- <div class="flex-none xl:flex-1 w-full xl:w-auto"> -->
            <ViewContainer {title} {loading}>
              <div {id} />
            </ViewContainer>
            <!-- </div> -->
          {/each}
        </div>
      {:else if typeof m === 'string'}
        <h2>{m}</h2>
      {:else}
        <ViewContainer title={m.title} loading={m.$loading}>
          <div id={m.id} />
        </ViewContainer>
      {/if}
    {/each}
  </div>
{/if}

<style type="text/postcss">
  .left {
    @apply shrink-0 p-1 w-full;
  }

  .right {
    @apply grow p-1;
  }

  @screen lg {
    .left {
      width: 350px;
    }

    .right {
      max-width: calc(100% - 350px);
    }
  }

  .fullw {
    max-width: 100%;
  }

  h2 {
    @apply font-medium text-gray-700 ml-2 text-2xl;
  }
</style>
