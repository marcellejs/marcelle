<script lang="ts">
  import { get } from 'svelte/store';

  import Button from './Button.svelte';
  import Select from './Select.svelte';
  import { TableDataProvider } from './table-abstract-provider';
  import TableActions from './TableActions.svelte';

  export let provider: TableDataProvider;
  export let actions: string[];
  export let selected: number[];

  $: total = provider.total;
  $: itemsPerPage = provider.options.itemsPerPage;

  let page = 1;

  $: numPages = Math.ceil($total / itemsPerPage);
  $: start = (page - 1) * itemsPerPage + 1;
  $: end = Math.min($total, page * itemsPerPage);

  function gotoPage(i: number): void {
    page = i;
    provider.page(i);
  }
</script>

<div class="table-footer">
  <div class="actions">
    {#if actions.length > 0 && selected.length > 0}
      <TableActions {provider} {actions} bind:selected on:selected />
    {:else}
      <Select
        options={['10', '20', '50', 'all']}
        value={itemsPerPage.toString()}
        on:change={({ detail }) => {
          const n = detail === 'all' ? get(total) : parseInt(detail);
          provider.paginate(n);
          itemsPerPage = n;
        }}
      />
    {/if}
  </div>
  <div class="count">
    Showing {start} to {end} of {$total} results
  </div>

  <div class="right">
    <Button
      size="small"
      disabled={page === 1}
      on:click={() => {
        gotoPage(page - 1);
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </Button>
    {#each Array.from(Array(numPages), (_, j) => j + 1) as i}
      <Button
        variant={i === page ? 'filled' : 'outline'}
        size="small"
        on:click={() => {
          gotoPage(i);
        }}
      >
        {i}
      </Button>
    {/each}
    <Button
      size="small"
      disabled={page === numPages}
      on:click={() => {
        gotoPage(page + 1);
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </Button>
  </div>
</div>

<style>
  .table-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    border-top: 1px solid rgb(229, 231, 235);
  }
</style>
