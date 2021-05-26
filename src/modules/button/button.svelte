<script lang="ts">
  import type { Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';
  import Button from '../../ui/components/Button.svelte';

  export let title: string;
  export let text: Stream<string>;
  export let down: Stream<boolean>;
  export let loading: Stream<boolean>;
  export let disabled: Stream<boolean>;
  export let type: Stream<'default' | 'success' | 'warning' | 'danger'>;
</script>

<ModuleBase {title} loading={$loading}>
  <div>
    <Button disabled={$disabled} type={$type} bind:pressed={$down} on:click>{$text}</Button>
  </div>
</ModuleBase>
