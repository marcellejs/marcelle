<script lang="ts">
  import type { Dataset, Instance, Stream } from '../../core';
  import type { Column } from '../../ui/components/table-types';
  import { onMount, tick } from 'svelte';
  import { ViewContainer } from '../../core';
  import { TableServiceProvider } from '../../ui/components/table-service-provider';
  import Spinner from '../../ui/components/Spinner.svelte';
  import Table from '../../ui/components/Table.svelte';

  export let title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dataset: Dataset<any, any>;
  export let colNames: Stream<string[]>;
  export let singleSelection = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let selection: Stream<Instance<any, any>[]>;

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
      if (dataset.$count.value > 0) {
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
  {:then _}
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
