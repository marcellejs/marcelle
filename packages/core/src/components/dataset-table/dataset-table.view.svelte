<script lang="ts">
  import type { Dataset, Instance, Stream } from '../../core';
  import type { Column } from '@marcellejs/design-system';
  import { onMount, tick } from 'svelte';
  import { TableServiceProvider, Spinner, Table, ViewContainer } from '@marcellejs/design-system';

  export let title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dataset: Dataset<Instance>;
  export let colNames: Stream<string[]>;
  export let singleSelection = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let selection: Stream<Instance[]>;

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
      if (dataset.$count.get() > 0) {
        const [firstInstance] = await dataset.items().take(1).toArray();
        columns = columns.map(({ name }) => ({
          name,
          type: getType(firstInstance[name]),
          sortable: isSortable(firstInstance[name]),
        }));
      }
      provider.query.$select = columns.map((x) => x.name).concat(['id']);
      provider.update();
    });
    const unSub = dataset.$count.subscribe(async (c) => {
      if (c > 0) {
        const [firstInstance] = await dataset.items().take(1).toArray();
        columns = columns.map(({ name }) => ({
          name,
          type: getType(firstInstance[name]),
          sortable: isSortable(firstInstance[name]),
        }));
        unSub();
      }
    });
  });
</script>

<ViewContainer {title}>
  {#await dataset.ready}
    <Spinner />
  {:then}
    {#if provider}
      <Table
        {provider}
        {columns}
        {singleSelection}
        on:selection={({ detail }) => {
          selection.set(detail);
        }}
        actions={[{ name: 'delete' }]}
      />
    {/if}
  {/await}
</ViewContainer>
