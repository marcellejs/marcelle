<script lang="ts">
  import type { Dataset, Instance } from '../../core';
  import type { BehaviorSubject } from 'rxjs';
  import { onMount, tick } from 'svelte';
  import { TableServiceProvider, Table, type Column } from '../../utils/design-system';

  export let dataset: Dataset<Instance>;
  export let colNames: BehaviorSubject<string[]>;
  export let singleSelection = false;
  export let selection: BehaviorSubject<Instance[]>;

  let columns: Column[] = [
    { name: 'x' },
    { name: 'y', sortable: true },
    { name: 'thumbnail', type: 'image' },
    { name: 'updatedAt', sortable: true },
  ];

  function getType(x: unknown): Column['type'] {
    if (typeof x === 'string' && x.includes('data:image/')) {
      return 'image';
    }
    if (typeof x === 'string' && !isNaN(Date.parse(x))) {
      return 'date';
    }
    if (Array.isArray(x)) {
      if ((x.length > 1 && Array.isArray(x[0])) || x.length > 3) {
        return 'array';
      }
    }
    return 'generic';
  }

  function isSortable(x: unknown): boolean {
    if (getType(x) !== 'image') {
      return true;
    }
    return false;
  }

  let provider: TableServiceProvider;
  onMount(async () => {
    await tick();
    await dataset.ready;
    provider = new TableServiceProvider({ service: dataset.instanceService, columns });
    colNames.subscribe(async (cols) => {
      columns = cols.map((name) => ({ name }));
      if (dataset.$count.getValue() > 0) {
        const [firstInstance] = await dataset.items().query(dataset.query).take(1).toArray();
        columns = columns.map(({ name }) => ({
          name,
          type: getType(firstInstance[name]),
          sortable: isSortable(firstInstance[name]),
        }));
      }
      for (const [key, v] of Object.entries(dataset.query)) {
        provider.query[key] = v;
      }
      provider.query.$select = columns.map((x) => x.name).concat(['id']);
      provider.update();
    });
    const sub = dataset.$count.subscribe(async (c) => {
      if (c > 0) {
        const [firstInstance] = await dataset.items().query(dataset.query).take(1).toArray();
        columns = columns.map(({ name }) => ({
          name,
          type: getType(firstInstance[name]),
          sortable: isSortable(firstInstance[name]),
        }));
        sub.unsubscribe();
      }
    });
  });
</script>

{#await dataset.ready}
  <div class="w-full min-h-28 flex flex-col justify-center items-center">
    <span class="loading loading-spinner loading-lg"></span>
  </div>
{:then}
  {#if provider}
    <Table
      {provider}
      {columns}
      {singleSelection}
      on:selection={({ detail }) => {
        selection.next(detail);
      }}
      actions={[{ name: 'delete', confirm: true }]}
    />
  {/if}
{/await}
