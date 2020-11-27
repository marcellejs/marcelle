<script lang="ts">
  import type { Stream } from '../../core';
  import ModuleBase from '../../core/ModuleBase.svelte';
  import Switch from '../../ui/widgets/Switch.svelte';

  export let title: string;
  export let text: Stream<string>;
  export let checked: Stream<boolean>;
  export let disabled: Stream<boolean>;
</script>

<svelte:options accessors />

<ModuleBase {title}>
  <Switch bind:checked={$checked} bind:disabled={$disabled} bind:text={$text} />
</ModuleBase>
