<script lang="ts">
  import type { Action } from './table-types';
  import { get } from 'svelte/store';
  import Button from './Button.svelte';
  import Select from './Select.svelte';
  import { TableDataProvider } from './table-abstract-provider';
  import TableActions from './TableActions.svelte';

  export let provider: TableDataProvider;
  export let actions: Action[];
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
      <TableActions {provider} {actions} bind:selected on:selected on:action />
    {/if}
  </div>

  <div class="flex items-center">
    <div class="flex items-center mx-4">
      Items per page:
      <div class="w-12 ml-2">
        <Select
          size="small"
          options={['10', '20', '50', 'all']}
          value={itemsPerPage.toString()}
          on:change={({ detail }) => {
            const n = detail === 'all' ? get(total) : parseInt(detail);
            provider.paginate(n);
            itemsPerPage = n;
          }}
        />
      </div>
    </div>
    <div class="mx-3">
      {start}-{end} of {$total}
    </div>
    <Button
      round
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
    <input
      class="marcelle w-8 rounded mr-1 mb-1 bg-white text-gray-600 border border-solid border-gray-300 text-center focus:outline-none focus:ring-blue-400 focus:ring-2 focus:ring-opacity-50 active:ring-blue-400 active:ring-4 active:ring-opacity-50"
      value={page.toString()}
      on:blur={(e) => {
        let i = parseInt(e.currentTarget.value);
        if (isNaN(i)) return;
        gotoPage(Math.max(1, Math.min(numPages, i)));
      }}
    />

    <Button
      round
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
