<script lang="ts">
  import { formatDistanceToNow } from 'date-fns';
  import { createEventDispatcher } from 'svelte';
  import Button from './Button.svelte';
  import type { Column } from './table-types';

  export let type: Column['type'] = 'generic';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let value: any = null;

  const dispatch = createEventDispatcher();

  function getArrayShape(arr: unknown[]): number[] {
    if (!Array.isArray(arr)) return [];
    if (arr.length > 0 && Array.isArray(arr[0])) {
      return [arr.length, ...getArrayShape(arr[0])];
    }
    return [arr.length];
  }

  function formatDate(v: string) {
    try {
      return formatDistanceToNow(Date.parse(v), { includeSeconds: true, addSuffix: true });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('Date Parsing Error', v, error);
      return v;
    }
  }
</script>

<td>
  {#if type === 'image'}
    <img alt="thumbnail" src={value} width="30" height="30" class="rounded-md" />
  {:else if type === 'link'}
    <Button
      size="small"
      on:click={() => {
        // eslint-disable-next-line no-console
        console.log('GOTO:', value.href);
      }}>{value.text}</Button
    >
  {:else if type === 'action'}
    <Button size="small" on:click={() => dispatch('action', value)}>{value}</Button>
  {:else if type === 'slot'}
    <slot />
  {:else if type === 'date'}
    {formatDate(value)}
  {:else if type === 'array'}
    Array({getArrayShape(value).join(', ')})
  {:else if typeof value === 'number'}
    {value.toPrecision(2)}
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
