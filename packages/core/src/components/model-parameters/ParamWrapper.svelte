<script lang="ts">
  import type { Stream } from '../../core/stream';
  import Number from '../../ui/components/Number.svelte';
  import NumberArray from '../../ui/components/NumberArray.svelte';
  import Input from '../../ui/components/Input.svelte';
  import Switch from '../../ui/components/Switch.svelte';
  import Select from '../../ui/components/Select.svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let stream: Stream<any>;
  export let spec: { type: string; options?: string[] };
</script>

<div style="flex-grow: 1;">
  {#if spec.type === 'menu' && Array.isArray(spec.options) && spec.options.length > 0}
    <Select options={spec.options} bind:value={$stream} />
  {:else if spec.type === 'boolean' || (spec.type === 'auto' && typeof stream.value === 'boolean')}
    <Switch bind:checked={$stream} />
  {:else if spec.type === 'number' || (spec.type === 'auto' && typeof stream.value === 'number')}
    <Number bind:value={$stream} />
  {:else if spec.type === 'number array' || (spec.type === 'auto' && Array.isArray(stream.value) && stream.value.length && typeof stream.value[0] === 'number')}
    <NumberArray bind:value={$stream} />
  {:else}
    <Input type="text" bind:value={$stream} />
  {/if}
</div>
