<script lang="ts">
  import type { Stream } from '../../core/stream';
  import { Number, NumberArray, Input, Switch, Select } from '@marcellejs/design-system';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let stream: Stream<any>;
  export let spec: { type: string; options?: string[] };
</script>

<div style="flex-grow: 1;">
  {#if spec.type === 'menu' && Array.isArray(spec.options) && spec.options.length > 0}
    <Select options={spec.options} bind:value={$stream} />
  {:else if spec.type === 'boolean' || (spec.type === 'auto' && typeof stream.get() === 'boolean')}
    <Switch bind:checked={$stream} />
  {:else if spec.type === 'number' || (spec.type === 'auto' && typeof stream.get() === 'number')}
    <Number bind:value={$stream} />
  {:else if spec.type === 'number array' || (spec.type === 'auto' && Array.isArray(stream.get()) && stream.get().length && typeof stream.get()[0] === 'number')}
    <NumberArray bind:value={$stream} />
  {:else}
    <Input type="text" bind:value={$stream} />
  {/if}
</div>
