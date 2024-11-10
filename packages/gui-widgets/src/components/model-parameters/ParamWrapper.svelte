<script lang="ts">
  import { BehaviorSubject } from 'rxjs';
  import Number from '../number/Number.svelte';
  import NumberArray from '../number-array/NumberArray.svelte';

  interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stream: BehaviorSubject<any>;
    spec: { type: string; options?: string[] };
  }

  let { stream, spec }: Props = $props();
</script>

<div style="flex-grow: 1;">
  {#if spec.type === 'menu' && Array.isArray(spec.options) && spec.options.length > 0}
    <select class="mgui-select mgui-select-bordered mgui-w-full mgui-max-w-xs" bind:value={$stream}>
      {#each spec.options as option}
        <option>{option}</option>
      {/each}
    </select>
  {:else if spec.type === 'boolean' || (spec.type === 'auto' && typeof stream.getValue() === 'boolean')}
    <input type="checkbox" class="mgui-toggle" bind:checked={$stream} />
  {:else if spec.type === 'number' || (spec.type === 'auto' && typeof stream.getValue() === 'number')}
    <Number bind:value={$stream} />
  {:else if spec.type === 'number array' || (spec.type === 'auto' && Array.isArray(stream.getValue()) && stream.getValue().length && typeof stream.getValue()[0] === 'number')}
    <NumberArray bind:value={$stream} />
  {:else}
    <input type="text" class="mgui-input mgui-input-bordered" bind:value={$stream} />
  {/if}
</div>
