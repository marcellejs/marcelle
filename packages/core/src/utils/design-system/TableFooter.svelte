<script lang="ts">
  import { run } from 'svelte/legacy';

  import type { Action } from './table-types';
  import type { TableDataProvider } from './table-abstract-provider';
  import TableActions from './TableActions.svelte';

  interface Props {
    provider: TableDataProvider;
    actions: Action[];
    selected: number[];
  }

  let { provider, actions, selected = $bindable() }: Props = $props();

  let itemsPerPage = $state(provider.options.itemsPerPage || 10);

  let page = $state(1);
  let numPages = $state(1);
  let start = $state(0);
  let end = $state(0);
  let total = $state(0);
  let unsub = $state(() => {});

  run(() => {
    unsub();
    unsub = provider.total.subscribe((t) => {
      if (t === undefined || t === 0) {
        numPages = 1;
        start = 0;
        end = 0;
        total = 0;
      } else {
        numPages = Math.ceil(total / itemsPerPage);
        start = (page - 1) * itemsPerPage + 1;
        end = Math.min(total || 0, page * itemsPerPage);
        total = t;
      }
    });
  });

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
    <div class="mx-4 flex items-center">
      Items per page:
      <div class="ml-2 w-12">
        <select
          class="select select-bordered select-sm w-full max-w-xs"
          value={itemsPerPage.toString()}
          onchange={({ currentTarget }) => {
            const n = currentTarget.value === 'all' ? total : parseInt(currentTarget.value);
            provider.paginate(n);
            itemsPerPage = n;
          }}
        >
          {#each ['10', '20', '50', 'all'] as option}
            <option>{option}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="mx-3">
      {start}-{end} of {total}
    </div>
    <button
      class="btn btn-circle"
      disabled={page === 1}
      onclick={() => {
        gotoPage(page - 1);
      }}
      aria-label="previous page"
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
    </button>
    <input
      class="marcelle mb-1 mr-1 w-8 rounded border border-solid border-gray-300 bg-white text-center text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 active:ring-4 active:ring-blue-400 active:ring-opacity-50"
      value={page.toString()}
      onblur={(e) => {
        let i = parseInt(e.currentTarget.value);
        if (isNaN(i)) return;
        gotoPage(Math.max(1, Math.min(numPages, i)));
      }}
    />

    <button
      class="btn btn-circle"
      disabled={page === numPages}
      onclick={() => {
        gotoPage(page + 1);
      }}
      aria-label="next page"
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
    </button>
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
