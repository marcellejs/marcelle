<script lang="ts">
  import { formatDistanceToNow } from 'date-fns';
  import type { Column } from './table-types';

  export let type: Column['type'] = 'generic';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let value: any = null;

  function getArrayShape(arr: unknown[]): number[] {
    if (!Array.isArray(arr)) return [];
    if (arr.length > 0 && Array.isArray(arr[0])) {
      return [arr.length, ...getArrayShape(arr[0])];
    }
    return [arr.length];
  }

</script>

<td>
  {#if type === 'image'}
    <img alt="thumbnail" src={value} width="30" height="30" class="rounded-md" />
  {:else if type === 'link'}
    <sl-button
      type="text"
      size="small"
      on:click={() => {
        // eslint-disable-next-line no-console
        console.log('GOTO:', value.href);
      }}>{value.text}</sl-button
    >
  {:else if type === 'slot'}
    <slot />
  {:else if type === 'date'}
    {formatDistanceToNow(Date.parse(value), { includeSeconds: true, addSuffix: true })}
    <!-- <sl-format-date date={value} /> at
    <sl-format-date
      hour="numeric"
      minute="numeric"
      second="numeric"
      hour-format="24"
      date={value}
    /> -->
  {:else if type === 'array'}
    Array({getArrayShape(value).join(', ')})
  {:else}
    {value}
  {/if}
</td>

<style>
  td {
    white-space: nowrap;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
  }

</style>
