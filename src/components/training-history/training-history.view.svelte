<script lang="ts">
  import type { Stream, TrainingRun } from '../../core';
  import type { Column } from '../../ui/components/table-types';
  import type { Service } from '@feathersjs/feathers';
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import { ViewContainer } from '../../core';
  import { TableServiceProvider } from '../../ui/components/table-service-provider';
  import Table from '../../ui/components/Table.svelte';
  import Tab from '../../ui/components/Tab.svelte';
  import TabList from '../../ui/components/TabList.svelte';
  import TabPanel from '../../ui/components/TabPanel.svelte';
  import Tabs from '../../ui/components/Tabs.svelte';
  import RunMeta from './RunMeta.svelte';
  import RunGraphs from './RunGraphs.svelte';

  export let title: string;
  export let service: Service<TrainingRun>;
  export let metrics: string[];
  export let actions: Array<string | { name: string }>;
  export let selection: Stream<TrainingRun[]>;

  const dispatch = createEventDispatcher();

  const provider = new TableServiceProvider({
    service,
    transform: {
      ...metrics.reduce(
        (res, metricName) => ({
          ...res,
          [metricName]: (x: { logs: Record<string, number[]> }) => {
            if (metricName in x.logs) {
              return x.logs[metricName][x.logs[metricName].length - 1];
            }
            return 'metrics not found';
          },
        }),
        {},
      ),
      ...actions.reduce(
        (res, action: string | { name: string }) => ({
          ...res,
          [typeof action === 'string' ? action : action.name]: () =>
            typeof action === 'string' ? action : action.name,
        }),
        {},
      ),
    },
  });

  const columns: Column[] = [
    { name: 'name', sortable: true },
    { name: 'start', sortable: true, type: 'date' },
    ...metrics.map((metricName) => ({ name: metricName })),
    { name: 'epochs' },
    { name: 'status' },
    ...actions.map(
      (action: string | { name: string }) =>
        ({
          name: typeof action === 'string' ? action : action.name,
          type: 'action',
        } as Column),
    ),
  ];

  let mainTable: Table;

  onMount(async () => {
    await tick();
    await tick();
    for (const action of actions) {
      const name = typeof action === 'string' ? action : action.name;
      mainTable.$on(name, ({ detail }) => {
        dispatch(name, detail);
      });
    }
  });
</script>

<ViewContainer {title}>
  <Table
    {columns}
    {provider}
    actions={[
      ...actions.map((name) => (typeof name === 'string' ? { name } : name)),
      { name: 'remove', confirm: true },
    ]}
    bind:selection={$selection}
    bind:this={mainTable}
    on:select={({ detail }) => dispatch('load', detail)}
  />

  <br />

  <Tabs>
    <TabList>
      <Tab>Graphs</Tab>
      <Tab>Metadata</Tab>
      <Tab>Parameters</Tab>
      <Tab>Model Summary</Tab>
    </TabList>

    <TabPanel>
      <RunGraphs logs={$selection.map((x) => x.logs)} names={$selection.map((x) => x.name)} />
    </TabPanel>

    <TabPanel>
      <RunMeta runs={$selection} />
    </TabPanel>

    <TabPanel>
      <RunMeta runs={$selection.map((x) => x.params)} />
    </TabPanel>

    <TabPanel>
      <div class="summaries">
        {#each $selection.map((x) => x.model?.summary || 'No summary available') as summary, i}
          <div>
            <h2>Model {i + 1}</h2>
            <div class="summary"><pre>{summary}<br></pre></div>
          </div>
        {/each}
      </div>
    </TabPanel>
  </Tabs>
</ViewContainer>

<style lang="postcss">
  .summaries {
    display: flex;
    overflow: scroll;
  }

  .summaries .summary {
    margin-right: 1rem;
    font-size: 0.8em;
  }
</style>
