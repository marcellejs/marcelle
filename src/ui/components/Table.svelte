<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import TableContentCell from './TableContentCell.svelte';
  import TableHeaderCell from './TableHeaderCell.svelte';
  import TableFooter from './TableFooter.svelte';
  import type { Column } from './table-types';
  import { TableDataProvider } from './table-abstract-provider';
  import { get } from 'svelte/store';

  export let columns: Array<Column>;
  export let provider: TableDataProvider;
  export let actions: string[] = [];

  $: data = provider.data;
  $: error = provider.error;

  const dispatch = createEventDispatcher();

  let sorting = { col: '', ascending: true };
  function sort({ detail }: { detail: { col: string; ascending: boolean } }) {
    sorting = detail;
    provider.sort(detail);
  }

  let selected: number[] = [];
  function dispatchSelection() {
    dispatch('selected', selected.map(provider.get.bind(provider)));
  }

  function selectAll() {
    if (selected.length === get(provider.data).length) {
      selected = [];
    } else {
      selected = get(provider.data).map((x, i) => i);
    }
    dispatchSelection();
  }

  function selectOne(
    index: number,
    e: MouseEvent & {
      currentTarget: EventTarget & HTMLInputElement;
    },
  ) {
    if (e.currentTarget.checked) {
      if (!selected.includes(index)) {
        selected = selected.concat([index]);
        dispatchSelection();
      }
    } else {
      selected = selected.filter((x) => x !== index);
      dispatchSelection();
    }
  }
</script>

{#if $error}
  <div class="service-error">
    <sl-alert type="danger" open>
      <sl-icon slot="icon" name="check2-circle" />
      <strong>Table Data Error</strong><br />
      {$error}
    </sl-alert>
  </div>
{/if}
<div class="marcelle table-container">
  <table>
    <thead>
      <tr>
        <th>
          <input type="checkbox" on:click={selectAll} />
        </th>
        {#each columns as { name, sortable }}
          <TableHeaderCell {name} {sortable} {sorting} on:sort={sort} />
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each $data as item, i}
        <tr>
          <TableContentCell type="slot">
            <input
              type="checkbox"
              checked={selected.includes(i)}
              on:click={(e) => selectOne(i, e)}
            />
          </TableContentCell>
          {#each columns as { type, name }}
            <TableContentCell {type} value={item[name]} />
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
  <TableFooter {provider} {actions} bind:selected />
</div>

<style>
  .table-container {
    display: flex;
    width: 100%;
    flex-direction: column;
    font-size: 0.8rem;
    border: 1px solid rgb(229, 231, 235);
    border-radius: 0.5rem;
    overflow: hidden;
  }

  table {
    min-width: 100%;
    border-collapse: collapse;
  }

  thead {
    background-color: rgb(249, 250, 251);
  }

  thead tr {
    width: 100%;
  }

  thead tr th {
    text-align: left;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    line-height: 1rem;
    font-weight: 500;
    color: rgb(107, 114, 128);
    letter-spacing: 0.05em;
  }

  tbody {
    background-color: white;
  }

  tbody > :not([hidden]) ~ :not([hidden]) {
    border-top: 1px solid rgb(229, 231, 235);
  }
</style>
