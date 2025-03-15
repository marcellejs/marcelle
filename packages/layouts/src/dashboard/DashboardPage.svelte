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
  <div class="mly:flex mly:flex-col mly:w-full mly:lg:flex-row">
    {#if dashboard.showSidebar}
    <div class="mly:w-full mly:shrink-0 mly:p-1 mly:lg:w-sm">
      {#each dashboard.componentsLeft as { id, title, $loading: loading } (id)}
        <ViewContainer {title} {loading}>
          <div {id}></div>
        </ViewContainer>
      {/each}
    </div>
  {/if}
  <div class="mly:grow mly:p-1">
    {#each dashboard.components as m, i (i)}
      {#if Array.isArray(m)}
        <div class="mly:flex mly:flex-row mly:flex-wrap mly:items-stretch mly:gap-1">
          {#each m as { id, title, $loading: loading } (id)}
            <ViewContainer {title} {loading}>
              <div {id}></div>
            </ViewContainer>
          {/each}
        </div>
      {:else if typeof m === 'string'}
        <h2 class="mly:ml-2 mly:text-2xl mly:font-medium mly:text-gray-700">{m}</h2>
      {:else}
        <ViewContainer title={m.title} loading={m.$loading}>
          <div id={m.id}></div>
        </ViewContainer>
      {/if}
    {/each}
  </div>
  </div>
{/if}

<style lang="postcss">
  @reference "../styles.css";

  .fullw {
    max-width: 100%;
  }
</style>
