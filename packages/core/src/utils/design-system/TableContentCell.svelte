<script lang="ts">
  import { formatDistanceToNow } from 'date-fns';
  import { createEventDispatcher } from 'svelte';
  import type { Column } from './table-types';

  interface Props {
    type?: Column['type'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any;
    children?: import('svelte').Snippet;
  }

  let { type = 'generic', value = null, children }: Props = $props();

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
      console.log('Date Parsing Error', v, error);
      return v;
    }
  }

  const children_render = $derived(children);
</script>

<td>
  {#if type === 'image'}
    <img alt="thumbnail" src={value} width="30" height="30" class="mcl-rounded-md" />
  {:else if type === 'link'}
    <button
      class="mcl-btn mcl-btn-outline mcl-btn-sm"
      onclick={() => {
        console.log('GOTO:', value.href);
      }}>{value.text}</button
    >
  {:else if type === 'action'}
    <button class="mcl-btn mcl-btn-outline mcl-btn-sm" onclick={() => dispatch('action', value)}>
      {value}
    </button>
  {:else if type === 'slot'}
    {@render children_render?.()}
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
