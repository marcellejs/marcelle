<script lang="ts">
  import { Table, TableArrayProvider } from '@marcellejs/design-system';

  export let runs: Record<string, unknown>[];

  $: columns = runs.map((_, i) => ({ name: `Run ${i + 1}` }));
  $: rows = runs.length > 0 ? Object.keys(runs[0]).filter((x) => x !== 'logs') : [];
  $: data = rows.map((field) =>
    runs
      .map((x, i) => ({ [`Run ${i + 1}`]: x[field] }))
      .reduce((o, x) => ({ ...o, ...x }), { field: field }),
  );
  $: provider = new TableArrayProvider({ data });
</script>

{#if runs.length > 0}
  <Table columns={[{ name: 'field' }, ...columns]} {provider} selectable={false} />
{:else}
  <div class="empty">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 7l4-4m0 0l4 4m-4-4v18"
      />
    </svg>
    <p>Select one or several runs to display information</p>
  </div>
{/if}

<style>
  .empty {
    margin: 2rem 0;
    color: grey;
    text-align: center;
  }
</style>
