<script lang="ts">
  import type { DashboardPage } from './dashboard_page';
  import ViewContainer from './ViewContainer.svelte';

  interface Props {
    dashboard: DashboardPage;
  }

  let { dashboard }: Props = $props();

  $effect(() => {
    dashboard.mount();
  });
</script>

{#if dashboard}
  {#if dashboard.showSidebar}
    <div class="left">
      {#each dashboard.componentsLeft as { id, title, $loading: loading } (id)}
        <ViewContainer {title} {loading}>
          <div {id}></div>
        </ViewContainer>
      {/each}
    </div>
  {/if}
  <div class="right" class:fullw={!dashboard.showSidebar}>
    {#each dashboard.components as m, i (i)}
      {#if Array.isArray(m)}
        <div class="flex flex-row flex-wrap items-stretch gap-1">
          {#each m as { id, title, $loading: loading } (id)}
            <ViewContainer {title} {loading}>
              <div {id}></div>
            </ViewContainer>
          {/each}
        </div>
      {:else if typeof m === 'string'}
        <h2>{m}</h2>
      {:else}
        <ViewContainer title={m.title} loading={m.$loading}>
          <div id={m.id}></div>
        </ViewContainer>
      {/if}
    {/each}
  </div>
{/if}

<style type="text/postcss">
  .left {
    @apply w-full shrink-0 p-1;
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
    @apply ml-2 text-2xl font-medium text-gray-700;
  }
</style>
