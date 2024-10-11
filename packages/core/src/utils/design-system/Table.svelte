<script lang="ts">
  import type { Action, Column } from './table-types';
  import type { TableDataProvider } from './table-abstract-provider';
  import { createEventDispatcher } from 'svelte';
  import TableContentCell from './TableContentCell.svelte';
  import TableHeaderCell from './TableHeaderCell.svelte';
  import TableFooter from './TableFooter.svelte';
  import { get } from 'svelte/store';

  export let columns: Column[];
  export let provider: TableDataProvider;
  export let actions: Action[] = [];
  export let selectable = true;
  export let singleSelection = false;
  export let selection: Array<Record<string, unknown>> = [];

  let selected: number[] = [];

  $: data = provider.data;
  $: error = provider.error;
  $: selected = selection.map((x) => get(data).indexOf(x));

  const dispatch = createEventDispatcher();

  let sorting = { col: '', ascending: true };
  function sort({ detail }: { detail: { col: string; ascending: boolean } }) {
    sorting = detail;
    provider.sort(detail);
  }

  async function dispatchSelection() {
    selection = await Promise.all(selected.map(provider.get.bind(provider)));
    dispatch('selection', selection);
  }

  function selectAll() {
    if (selected.length === get(data).length) {
      selected = [];
    } else {
      selected = get(data).map((x, i) => i);
    }
    dispatchSelection();
  }

  function selectOne(
    index: number,
    e: MouseEvent & {
      currentTarget: EventTarget & HTMLInputElement;
    },
  ) {
    if (singleSelection) {
      selected = e.currentTarget.checked ? [index] : [];
      dispatchSelection();
    } else {
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
  }

  async function propagateAction([actionName, sel]: [string, number | number[]]) {
    const s = Array.isArray(sel)
      ? await Promise.all(sel.map(provider.get.bind(provider)))
      : await provider.get(sel);
    dispatch(actionName, s);
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
        {#if selectable}
          <th>
            {#if !singleSelection}
              <input
                type="checkbox"
                checked={selected.length > 0 && selected.length === $data.length}
                on:click={selectAll}
              />
            {/if}
          </th>
        {/if}
        {#each columns as { name, sortable }}
          <TableHeaderCell {name} {sortable} {sorting} on:sort={sort} />
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each $data as item, i}
        <tr>
          {#if selectable}
            <TableContentCell type="slot">
              <input
                type="checkbox"
                checked={selected.includes(i)}
                on:click={(e) => selectOne(i, e)}
              />
            </TableContentCell>
          {/if}
          {#each columns as { type, name }}
            <TableContentCell
              {type}
              value={item[name]}
              on:action={({ detail }) => {
                propagateAction([detail, i]);
              }}
            />
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
  <TableFooter
    {provider}
    {actions}
    bind:selected
    on:action={({ detail }) => propagateAction(detail)}
  />
</div>

<style>
  .table-container {
    display: flex;
    width: 100%;
    flex-direction: column;
    font-size: 0.8rem;
    border: 1px solid rgb(229, 231, 235);
    border-radius: 0.5rem;
    overflow: scroll;
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
