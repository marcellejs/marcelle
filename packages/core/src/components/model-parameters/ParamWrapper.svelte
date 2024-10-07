<script lang="ts">
  import { Number, NumberArray, Select } from '@marcellejs/design-system';
  import { BehaviorSubject } from 'rxjs';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let stream: BehaviorSubject<any>;
  export let spec: { type: string; options?: string[] };
</script>

<div style="flex-grow: 1;">
  {#if spec.type === 'menu' && Array.isArray(spec.options) && spec.options.length > 0}
    <Select options={spec.options} bind:value={$stream} />
  {:else if spec.type === 'boolean' || (spec.type === 'auto' && typeof stream.getValue() === 'boolean')}
    <input type="checkbox" class="toggle" bind:checked={$stream} />
  {:else if spec.type === 'number' || (spec.type === 'auto' && typeof stream.getValue() === 'number')}
    <Number bind:value={$stream} />
  {:else if spec.type === 'number array' || (spec.type === 'auto' && Array.isArray(stream.getValue()) && stream.getValue().length && typeof stream.getValue()[0] === 'number')}
    <NumberArray bind:value={$stream} />
  {:else}
    <input type="text" class="input input-bordered" bind:value={$stream} />
  {/if}
</div>
